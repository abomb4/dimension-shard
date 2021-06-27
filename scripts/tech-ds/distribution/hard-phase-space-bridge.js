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

const lastBuildInvalidate = 60 * 10;
var globalLastBuildTime = 0;
var hardPhaseSpaceBridge = extend(ItemBridge, 'hard-phase-space-bridge', {

    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        const range = this.range;
        const tilesize = Vars.tilesize;
        Drawf.dashCircle(x * tilesize, y * tilesize, range * tilesize, Pal.accent);

        // check if a mass driver is selected while placing this driver
        if (!Vars.control.input.frag.config.isShown()) return;
        var selected = Vars.control.input.frag.config.getSelectedTile();
        if (selected == null || (selected.block != this) || !(selected.within(x * tilesize, y * tilesize, range * tilesize))) return;

        // if so, draw a dotted line towards it while it is in range
        var sin = Mathf.absin(Time.time, 6, 1);
        Tmp.v1.set(x * tilesize + this.offset, y * tilesize + this.offset).sub(selected.x, selected.y).limit((this.size / 2 + 1) * tilesize + sin + 0.5);
        var x2 = x * tilesize - Tmp.v1.x, y2 = y * tilesize - Tmp.v1.y,
            x1 = selected.x + Tmp.v1.x, y1 = selected.y + Tmp.v1.y;
        var segs = (selected.dst(x * tilesize, y * tilesize) / tilesize);

        Lines.stroke(2, Pal.gray);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Lines.stroke(1, Pal.placing);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Draw.reset();
    },
    linkValid(tile, other, checkDouble) {
        if (other == null || tile == null) return false;

        if (checkDouble === undefined) { checkDouble = true; }
        return other.block() === hardPhaseSpaceBridge
            && tile.block() === hardPhaseSpaceBridge
            && (!checkDouble || other.build.link != tile.pos())
            && tile.within(other, this.range * Vars.tilesize + Math.floor(this.size / 2));
    },
    positionsValid(x1, y1, x2, y2) {
        return Mathf.dst(x1, y1, x2, y2) <= this.range;
    },
    changePlacementPath(points, rotation) {
        Placement.calculateNodes(points, this, rotation, lib.boolf2((point, other) => this.positionsValid(point.x, point.y, other.x, other.y)));
    },
    findLink(x, y) {
        if (Time.time - globalLastBuildTime > lastBuildInvalidate) {
            return null;
        }
        return this.super$findLink(x, y);
    },
});
hardPhaseSpaceBridge.buildVisibility = BuildVisibility.shown;
hardPhaseSpaceBridge.category = Category.distribution;
hardPhaseSpaceBridge.size = 1;
hardPhaseSpaceBridge.health = 450;
hardPhaseSpaceBridge.hasItems = true;
hardPhaseSpaceBridge.hasLiquids = true;
hardPhaseSpaceBridge.outputsLiquid = true;
hardPhaseSpaceBridge.itemCapacity = 40;
hardPhaseSpaceBridge.liquidCapacity = 80;
hardPhaseSpaceBridge.liquidPressure = 1.3;
hardPhaseSpaceBridge.range = 18;
hardPhaseSpaceBridge.transportTime = 0.01;
hardPhaseSpaceBridge.requirements = ItemStack.with(
    Items.metaglass, 20,
    Items.silicon, 8,
    Items.plastanium, 10,
    Items.phaseFabric, 20,
    items.dimensionShard, 30,
    items.hardThoriumAlloy, 30,
);
hardPhaseSpaceBridge.consumes.power(0.8);

Events.on(BlockBuildBeginEvent, cons(e => {
    if (Vars.player != null && Vars.player.unit() == e.unit && e.tile.block() != hardPhaseSpaceBridge) {
        hardPhaseSpaceBridge.lastBuild = null;
    }
}));

lib.setBuildingSimple(hardPhaseSpaceBridge, ItemBridge.ItemBridgeBuild, block => ({
    transportTimer: new Interval(1),
    playerPlaced(config) {
        this.super$playerPlaced(config);
        globalLastBuildTime = Time.time;
    },
    drawConfigure() {
        var entity = this;
        var tile = this.tile;
        var block = this.block;
        var x = this.x;
        var y = this.y;

        Draw.color(Pal.accent);
        Lines.stroke(1);
        Lines.square(x, y, block.size * Vars.tilesize / 2 + 1);

        var target;
        if (entity.link != -1 && (target = Vars.world.tile(entity.link)) != null && this.block.linkValid(tile, target, true)) {
            Draw.color(Pal.place);
            Lines.square(target.x * Vars.tilesize, target.y * Vars.tilesize, block.size * Vars.tilesize / 2 + 1 + (Mathf.absin(Time.time, 4, 1)));
        }

        Drawf.dashCircle(x, y, this.block.range * Vars.tilesize, Pal.accent);
    },
    draw() {
        Draw.rect(this.block.region, this.x, this.y, this.block.rotate ? this.rotdeg() : 0);
        this.drawTeamTop();

        Draw.z(Layer.power);
        // Link each
        const tile = this.tile;
        const tilesize = Vars.tilesize;
        var entity = this;

        var other = Vars.world.tile(entity.link);
        if (!this.block.linkValid(tile, other)) return;
        var otherBuild = other.build;
        if (otherBuild == null) { return; }

        var opacity = Core.settings.getInt("bridgeopacity") / 100;
        if (Mathf.zero(opacity)) return;

        // draw it

        var angle = Angles.angle(tile.worldx(), tile.worldy(), other.worldx(), other.worldy());
        Draw.color(Color.white, Color.black, Mathf.absin(Time.time, 6, 0.07));
        Draw.alpha(Math.max(entity.uptime, 0.25) * opacity);

        Draw.rect(this.block.endRegion, this.x, this.y, angle + 90);
        Draw.rect(this.block.endRegion, otherBuild.x, otherBuild.y, angle + 270);

        Lines.stroke(8);
        Lines.line(this.block.bridgeRegion, tile.worldx(), tile.worldy(), other.worldx(), other.worldy(), false);

        var dist = Math.max(Math.abs(other.x - tile.x), Math.abs(other.y - tile.y));

        var time = entity.time2 / 1.7;
        var arrows = (dist) * tilesize / 4 - 2;

        Draw.color();

        for (var a = 0; a < arrows; a++) {
            Draw.alpha(Mathf.absin(a / arrows - entity.time / 100, 0.1, 1) * entity.uptime * opacity);
            Draw.rect(this.block.arrowRegion,
                tile.worldx() + Angles.trnsx(angle, (tilesize / 2 + a * 4 + time % 4)),
                tile.worldy() + Angles.trnsy(angle, (tilesize / 2 + a * 4 + time % 4)), angle);
        }
        Draw.reset();
    },
    canDump(to, item) {
        // 4 direction output
        return true;
    },
    acceptItem(source, item) {
        const tile = this.tile;
        if (this.team != source.team) return false;
        const itemCapacity = this.block.itemCapacity;

        var entity = this;
        var other = Vars.world.tile(entity.link);

        if (this.block.linkValid(tile, other)) {
            return this.items.total() < itemCapacity;
        } else {
            return source.block == this.block && source.link == tile.pos() && this.items.total() < itemCapacity;
        }

    },
    updateTile() {
        this.super$updateTile();
        // Try dump liquid if not be connected
        var entity = this;
        var tile = this.tile;
        var other = Vars.world.tile(entity.link);
        if (!this.block.linkValid(tile, other)) {
            this.dumpLiquid(entity.liquids.current());
        }
    },
    acceptLiquid(source, liquid) {
        if (this.team != source.team || !this.block.hasLiquids) return false;

        var entity = this;
        var tile = this.tile;
        var other = Vars.world.tile(entity.link);

        if (this.block.linkValid(tile, other)) {
            return true;
        } else if (!(source.block == this.block && source.link == tile.pos())) {
            return false;
        }

        return this.liquids.get(liquid) < this.block.liquidCapacity
            && (this.liquids.current() == liquid || this.liquids.get(this.liquids.current()) < 0.2);
    },
    updateTransport(other) {
        var entity = this;

        if (entity.uptime >= 0.5 && this.transportTimer.get(0, this.block.transportTime)) {
            // transport items
            var item = entity.items.take();
            if (item != null && other.acceptItem(this, item)) {
                other.handleItem(this, item);
                entity.cycleSpeed = Mathf.lerpDelta(entity.cycleSpeed, 4, 0.05);
            } else {
                entity.cycleSpeed = Mathf.lerpDelta(entity.cycleSpeed, 1, 0.01);
                if (item != null) entity.items.add(item, 1);
            }

            // transport liquid
            this.moveLiquid(other, this.liquids.current());
        }
    },
    moveLiquid(next, liquid) {
        // No self burning
        if (!next) { return 0; }

        const hotLine = 0.7;
        const coldLine = 0.55;

        next = next.getLiquidDestination(this, liquid);
        if (next.team == this.team && next.block.hasLiquids && this.liquids.get(liquid) > 0) {
            var ofract = next.liquids.get(liquid) / next.block.liquidCapacity;
            var fract = this.liquids.get(liquid) / this.block.liquidCapacity * this.block.liquidPressure;
            var flow = Math.min(Mathf.clamp(fract - ofract) * this.block.liquidCapacity, this.liquids.get(liquid));
            flow = Math.min(flow, next.block.liquidCapacity - next.liquids.get(liquid));

            if (flow > 0 && ofract <= fract && next.acceptLiquid(this, liquid)) {
                next.handleLiquid(this, liquid, flow);
                this.liquids.remove(liquid, flow);
                return flow;
            } else if (next.liquids.currentAmount() / next.block.liquidCapacity > 0.1 && fract > 0.1) {
                var fx = (this.x + next.x) / 2.0;
                var fy = (this.y + next.y) / 2.0;
                var other = next.liquids.current();
                // There was flammability logics, removed
                if ((liquid.temperature > hotLine && other.temperature < coldLine) || (other.temperature > hotLine && liquid.temperature < coldLine)) {
                    this.liquids.remove(liquid, Math.min(this.liquids.get(liquid), hotLine * Time.delta));
                    if (Mathf.chance(0.2 * Time.delta)) {
                        Fx.steam.at(fx, fy);
                    }
                }
            }
        }
    },
    checkDump(to){
        var other = Vars.world.tile(this.link);
        return (!this.block.linkValid(this.tile, other, false));
    }
}));

exports.hardPhaseSpaceBridge = hardPhaseSpaceBridge;
