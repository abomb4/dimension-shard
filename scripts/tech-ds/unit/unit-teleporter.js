// Copyright (C) 2020 abomb4
//
// This file is part of Dimension Shard.
//
// Dimension Shard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Dimension Shard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Dimension Shard.  If not, see <http://www.gnu.org/licenses/>.

const lib = require('abomb4/lib');
const items = require('ds-common/items');
const dsGlobal = require('ds-common/ds-global');

const ORANGE = Color.valueOf("#fea947");
const BLUE = Color.valueOf("#3ebdfc");

const unitInEffect = new Effect(8, cons(e => {
    const unitSize = e.data.getUnitSize();
    Draw.color(BLUE);
    Draw.alpha(0.7);
    Lines.stroke(e.fout() * 2);
    Lines.circle(e.x, e.y, 2 + e.finpow() * unitSize * 0.8);
}));

const unitOutEffect = new Effect(8, cons(e => {
    const unitSize = e.data.getUnitSize();
    Draw.color(ORANGE);
    Draw.alpha(0.7);
    Lines.stroke(e.fout() * 2);
    Lines.circle(e.x, e.y, 2 + e.finpow() * unitSize * 0.8);
}));

const inEffect = new Effect(38, cons(e => {
    const radius = 2 * 8 * 1.25;
    Draw.color(BLUE);

    Angles.randLenVectors(e.id, 1, radius * e.fout(), 0, 360, new Floatc2({
        get: (x, y) => {
            var angle = Angles.angle(0, 0, x, y);
            var trnsx = Angles.trnsx(angle, 2);
            var trnsy = Angles.trnsy(angle, 2);
            var trnsx2 = Angles.trnsx(angle, 4);
            var trnsy2 = Angles.trnsy(angle, 4);
            Fill.circle(
                e.x + trnsx + x + trnsx2 * e.fout(),
                e.y + trnsy + y + trnsy2 * e.fout(),
                e.fslope() * 0.8
            );
        }
    }));
}));

const outEffect = new Effect(38, cons(e => {
    const radius = 2 * 8 * 1.25;
    Draw.color(ORANGE);

    Angles.randLenVectors(e.id, 1, radius * e.fin(), 0, 360, new Floatc2({
        get: (x, y) => {
            var angle = Angles.angle(0, 0, x, y);
            var trnsx = Angles.trnsx(angle, 2);
            var trnsy = Angles.trnsy(angle, 2);
            var trnsx2 = Angles.trnsx(angle, 4);
            var trnsy2 = Angles.trnsy(angle, 4);
            Fill.circle(
                e.x + trnsx + x + trnsx2 * e.fin(),
                e.y + trnsy + y + trnsy2 * e.fin(),
                e.fslope() * 0.8
            );
        }
    }));
}));

// 传送生效范围，size单位
const TELEPORTER_RADIUS = 3 * 8;
// 传送距离，block 单位（x8 = 实际距离）
const RANGE = 80;
// 不可建造方格，多个传送器不能离得太近
const UNBUILDABLE_RADIUS = 1;
// 小范围内多少单位则不进行传送
const TOO_MUCH_UNITS = 5 * 8;
const TOO_MUCH_RADIUS = 5 * 8;

var borderRegion
var wrapRegion
var middleRegion
var innerRegion
const block = new JavaAdapter(Block, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
    load() {
        borderRegion = lib.loadRegion("unit-teleporter-border");
        innerRegion = lib.loadRegion("unit-teleporter-inner");
        middleRegion = lib.loadRegion("unit-teleporter-middle");
        wrapRegion = lib.loadRegion("unit-teleporter-wrap");
        this.super$load();
    },
    setStats() {
        this.super$setStats();
        this.stats.add(Stat.range, RANGE, StatUnit.blocks);
    },
    drawPlace(x, y, rotation, valid) {
        const range = RANGE;
        const tilesize = Vars.tilesize;
        Drawf.dashCircle(x * tilesize, y * tilesize, range * tilesize, Pal.accent);

        // check if a mass driver is selected while placing this driver
        if (!Vars.control.input.frag.config.isShown()) return;
        var selected = Vars.control.input.frag.config.getSelectedTile();
        if (selected == null || !(selected.dst(x * tilesize, y * tilesize) <= range * tilesize)) return;

        // if so, draw a dotted line towards it while it is in range
        var sin = Mathf.absin(Time.time, 6, 1);
        Tmp.v1.set(x * tilesize, y * tilesize).sub(selected.x, selected.y).limit((this.size / 2 + 1) * tilesize + sin + 0.5);
        var x2 = x * tilesize - Tmp.v1.x, y2 = y * tilesize - Tmp.v1.y,
            x1 = selected.x + Tmp.v1.x, y1 = selected.y + Tmp.v1.y;
        var segs = (selected.dst(x * tilesize, y * tilesize) / tilesize);

        Lines.stroke(2, Pal.gray);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Lines.stroke(1, Pal.placing);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Draw.reset();
    },

}, "unit-teleporter")

block.category = Category.units;
block.buildVisibility = BuildVisibility.shown;
block.size = 4;
block.health = 1250;
block.requirements = ItemStack.with(
    Items.copper, 500,
    Items.silicon, 180,
    Items.phaseFabric, 300,
    items.spaceCrystal, 200,
    items.hardThoriumAlloy, 120,
);
block.update = true;
block.posConfig = true;
block.hasItems = false;
block.configurable = true;
block.unloadable = true;
block.breakable = true;
block.solid = false;
block.expanded = true;
block.consumes.power(4.5);

function getBuild(pos) {
    const tile = Vars.world.tile(pos);
    if (tile != null) {
        return tile.build;
    }
    return null;
}
function linkValid(self, other, checkDouble) {
    if (other == null || self == null) {
        return false;
    }

    // 连了别人的节点不能连
    // 被连过的也不能连
    // 自己被连的不能连别人
    return other.block == block
        && self.getConnected() == null
        && (other.getConnected() == null || (self.getTarget() == other.pos()))
        && !(Vars.world.tile(other.getTarget()))
        && self.dst(other) <= RANGE * Vars.tilesize;
}

function isTeleportActive(building) {
    return building != null && building.getUptime() > 0.2;
}

const drawArray = [];
Events.run(Trigger.preDraw, run(() => {
    while (drawArray.pop()) {}
}));
lib.setBuilding(block, (block) => {
    var target = -1;
    // now 'connected' means connected by.
    var connected = null;
    var uptime = 0;
    var rotateSpeed = 0;
    var rotate = 0;
    var lastColor = BLUE;

    return new JavaAdapter(Building, {
        draw() {
            drawArray.push(this);
            this.super$draw();
            const entity = this;
            if (entity.getUptime() > 0) {
                Draw.color(entity.getLastColor());
                Draw.alpha(Math.min(0.9, uptime));
                Draw.rect((innerRegion), this.x, this.y, rotate);
                Draw.alpha(Math.min(0.6, uptime));
                Draw.rect((middleRegion), this.x, this.y, 360 - (rotate % 360));
                Draw.alpha(Math.min(0.4, uptime));
                Draw.rect((wrapRegion), this.x, this.y);
                Draw.alpha(Math.min(1, uptime));
                Draw.rect((borderRegion), this.x, this.y);
                Draw.reset();
            }

            // 连线
            var opacity = Math.max(entity.getUptime(), 0.25) * Core.settings.getInt("bridgeopacity") / 100;
            if (Mathf.zero(opacity)) return;

            const other = getBuild(entity.getTarget());

            // Draw line between
            if (linkValid(entity, other, true) && isTeleportActive(entity) && isTeleportActive(other)) {
                Draw.z(Layer.power);
                var angle = Angles.angle(entity.x, entity.y, other.x, other.y);
                Lines.stroke(0.6);
                // Lines.line(tile.x, tile.y, other.x, other.y);
                var spreadLength = Mathf.absin(Time.time, 6, 1.6);
                spreadLength = 0.8 - spreadLength;
                var lineOffsetX = Angles.trnsx(angle, block.size * 4 + 2);
                var lineOffsetY = Angles.trnsy(angle, block.size * 4 + 2);

                Draw.color(ORANGE);
                Draw.alpha(opacity * 0.5);
                Drawf.laser(this.team, Blocks.powerNode.laser, Blocks.powerNode.laserEnd,
                    entity.x + Angles.trnsx(angle + 90, spreadLength) + lineOffsetX,
                    entity.y + Angles.trnsy(angle + 90, spreadLength) + lineOffsetY,
                    other.x + Angles.trnsx(angle + 90, spreadLength) - lineOffsetX,
                    other.y + Angles.trnsy(angle + 90, spreadLength) - lineOffsetY, 0.25
                );

                Draw.color(BLUE);
                Draw.alpha(opacity * 0.5);
                Drawf.laser(this.team, Blocks.powerNode.laser, Blocks.powerNode.laserEnd,
                    entity.x + Angles.trnsx(angle - 90, spreadLength) + lineOffsetX,
                    entity.y + Angles.trnsy(angle - 90, spreadLength) + lineOffsetY,
                    other.x + Angles.trnsx(angle - 90, spreadLength) - lineOffsetX,
                    other.y + Angles.trnsy(angle - 90, spreadLength) - lineOffsetY, 0.25
                );
                Draw.reset();
            }

            if (linkValid(connected, entity, true) && isTeleportActive(entity) && isTeleportActive(connected) && drawArray.indexOf(connected) < 0) {
                Draw.z(Layer.power);
                var angle = Angles.angle(connected.x, connected.y, entity.x, entity.y);
                Lines.stroke(0.6);
                // Lines.line(tile.x, tile.y, entity.x, entity.y);
                var spreadLength = Mathf.absin(Time.time, 6, 1.6);
                spreadLength = 0.8 - spreadLength;
                var lineOffsetX = Angles.trnsx(angle, block.size * 4 + 2);
                var lineOffsetY = Angles.trnsy(angle, block.size * 4 + 2);

                Draw.color(ORANGE);
                Draw.alpha(opacity * 0.5);
                Drawf.laser(this.team, Blocks.powerNode.laser, Blocks.powerNode.laserEnd,
                    connected.x + Angles.trnsx(angle + 90, spreadLength) + lineOffsetX,
                    connected.y + Angles.trnsy(angle + 90, spreadLength) + lineOffsetY,
                    entity.x + Angles.trnsx(angle + 90, spreadLength) - lineOffsetX,
                    entity.y + Angles.trnsy(angle + 90, spreadLength) - lineOffsetY, 0.25
                );

                Draw.color(BLUE);
                Draw.alpha(opacity * 0.5);
                Drawf.laser(this.team, Blocks.powerNode.laser, Blocks.powerNode.laserEnd,
                    connected.x + Angles.trnsx(angle - 90, spreadLength) + lineOffsetX,
                    connected.y + Angles.trnsy(angle - 90, spreadLength) + lineOffsetY,
                    entity.x + Angles.trnsx(angle - 90, spreadLength) - lineOffsetX,
                    entity.y + Angles.trnsy(angle - 90, spreadLength) - lineOffsetY, 0.25
                );
                Draw.reset();
            }

            Draw.reset();
        },
        drawConfigure() {
            var entity = this;

            Draw.color(Pal.accent);
            Lines.stroke(1);
            Lines.square(this.x, this.y, block.size * Vars.tilesize / 2 + 1);

            var target;
            if (entity.getTarget() != -1 && (target = getBuild(entity.getTarget())) != null && linkValid(entity, target, true)) {
                var sin = Mathf.absin(Time.time, 6, 1);

                Draw.color(Pal.place);
                Lines.square(target.x, target.y, target.block.size * Vars.tilesize / 2 + 1 + (Mathf.absin(Time.time, 4, 1)));

                Draw.color(Pal.accent);
                Drawf.arrow(this.x, this.y, target.x, target.y, block.size * Vars.tilesize + sin, 4 + sin);
            }

            Drawf.dashCircle(this.x, this.y, RANGE * Vars.tilesize, Pal.accent);
        },
        tryInvalidOriginTarget(other) {
            var originOther = getBuild(other.getTarget());
            if (originOther != null && originOther.getConnected() != null) {
                originOther.setConnected(null);
            }
        },
        onConfigureTileTapped(other) {
            var entity = this;
            if (this == other) {
                this.tryInvalidOriginTarget(entity);
                entity.configure(-1);
                return false;
            }
            if (linkValid(entity, other, true)) {
                this.tryInvalidOriginTarget(entity);
                if (entity.getTarget() == other.pos()) {
                    entity.configure(-1);
                } else if (other.getTarget() != entity.pos()) {
                    entity.configure(other.pos());
                }
                return false;
            }
            return true;
        },
        configure(value) {
            this.setTarget(value);
            this.setLastColor(BLUE);
            const other = getBuild(value);
            if (other && other.block == block) {
                other.setLastColor(ORANGE);
            }
        },
        update() {
            this.super$update();

            var entity = this;
            var targetPos = entity.getTarget();
            var target = getBuild(targetPos);
            var shouldConsume = false;

            if (linkValid(entity, target, false)) {
                shouldConsume = true;
                target.setConnected(entity);
                if (isTeleportActive(entity) && isTeleportActive(target)) {
                    // Draw sender effect
                    if (Mathf.random(60) > 48) {
                        Time.run(Mathf.random(10), run(() => {
                            inEffect.at(entity.x, entity.y, 0);
                        }));
                    }

                    // Try teleport units in range
                    // If too much units on target teleporter, abort.
                    var isTooMuch = (() => {
                        var counter = {
                            count: 0,
                            inited: false,
                            add() {
                                this.count++;
                                this.inited = true;
                            }
                        };
                        return function() {
                            if (!counter.inited) {
                                Units.nearby(entity.team, target.x, target.y, TOO_MUCH_RADIUS, cons((unit) => {
                                    if (!unit.isFlying()) {
                                        counter.add();
                                    }
                                }));
                            }
                            return counter.count >= TOO_MUCH_UNITS;
                        }
                    })();
                    Units.nearby(entity.team, this.x, this.y, TELEPORTER_RADIUS, cons((unit) => {
                        if (!unit.isFlying() && !isTooMuch()) {
                            // TELEPORT!
                            unitInEffect.at(unit.x, unit.y, 0, {
                                getUnitSize() { return unit.hitSize }
                            });

                            var outX = target.x + Mathf.range(block.size * Vars.tilesize / 2);
                            var outY = target.y + Mathf.range(block.size * Vars.tilesize / 2);
                            unit.set(outX, outY);
                            if (unit.resetLegs !== undefined) {
                                unit.resetLegs();
                            }
                            unitOutEffect.at(outX, outY, 0, {
                                getUnitSize() { return unit.hitSize }
                            });
                        }
                    }));
                }
            }

            if (entity.getConnected() != null) {
                shouldConsume = true;
            }

            if (shouldConsume && entity.cons.valid() && Mathf.zero(1 - entity.efficiency())) {
                entity.setUptime(Mathf.lerpDelta(entity.uptime, 1, 0.03));
                if ((isTeleportActive(entity) && isTeleportActive(target))
                    || (entity.getConnected() != null && isTeleportActive(entity.getConnected()))) {
                    rotateSpeed = Mathf.lerpDelta(rotateSpeed, 1, 0.03);
                } else {
                    rotateSpeed = Mathf.lerpDelta(rotateSpeed, 0, 0.02);
                }
            } else {
                entity.setUptime(Mathf.lerpDelta(entity.uptime, 0, 0.02));
                rotateSpeed = Mathf.lerpDelta(rotateSpeed, 0, 0.02);
            }
            rotate += rotateSpeed;

            // Draw receiver
            if (entity.getConnected() != null && isTeleportActive(entity.getConnected()) && isTeleportActive(entity)) {
                // Draw.color(ORANGE);
                // Draw.alpha(opacity);
                // Lines.circle(tile.x, tile.y, TELEPORTER_RADIUS);
                if (Mathf.random(60) > 48) {
                    Time.run(Mathf.random(10), run(() => {
                        outEffect.at(entity.x, entity.y, 0);
                    }));
                }
            }
        },

        // Save Load
        write(writer) {
            this.super$write(writer);
            writer.i(target);
            writer.i(connected == null ? -1 : connected.pos());
            writer.f(uptime);
            writer.bool(lastColor == BLUE ? true : false);
        },
        read(read, revision) {
            target = read.i();
            connected = getBuild(read.i());
            uptime = read.f();
            lastColor = read.bool() ? BLUE : ORANGE;
            this.super$read(read, revision);
        },
        // custom
        setTarget(v) { target = v; },
        getTarget() { return target; },
        setUptime(v) { uptime = v; },
        getUptime() { return uptime; },
        setConnected(v) { connected = v; },
        getConnected() { return connected; },
        setLastColor(v) { lastColor = v; },
        getLastColor() { return lastColor; },
    });
});

exports.unitTeleporter = block;
