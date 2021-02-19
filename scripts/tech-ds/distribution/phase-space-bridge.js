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

const lastBuildInvalidate = 60 * 10;
let globalLastBuildTime = 0;
let phaseSpaceBridge = extend(ItemBridge, 'phase-space-bridge', {

    drawPlace(x, y, rotation, valid) {
        const range = this.range;
        const tilesize = Vars.tilesize;
        Drawf.dashCircle(x * tilesize, y * tilesize, range * tilesize, Pal.accent);

        // check if a mass driver is selected while placing this driver
        if (!Vars.control.input.frag.config.isShown()) return;
        let selected = Vars.control.input.frag.config.getSelectedTile();
        if (selected == null || (selected.block != this) || !(selected.within(x * tilesize, y * tilesize, range * tilesize))) return;

        // if so, draw a dotted line towards it while it is in range
        let sin = Mathf.absin(Time.time, 6, 1);
        Tmp.v1.set(x * tilesize + this.offset, y * tilesize + this.offset).sub(selected.x, selected.y).limit((this.size / 2 + 1) * tilesize + sin + 0.5);
        let x2 = x * tilesize - Tmp.v1.x, y2 = y * tilesize - Tmp.v1.y,
            x1 = selected.x + Tmp.v1.x, y1 = selected.y + Tmp.v1.y;
        let segs = (selected.dst(x * tilesize, y * tilesize) / tilesize);

        Lines.stroke(2, Pal.gray);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Lines.stroke(1, Pal.placing);
        Lines.dashLine(x1, y1, x2, y2, segs);
        Draw.reset();
    },
    linkValid(tile, other, checkDouble) {
        if (other == null || tile == null) return false;

        if (checkDouble === undefined) { checkDouble = true; }
        return other.block() === phaseSpaceBridge
            && tile.block() === phaseSpaceBridge
            && (!checkDouble || other.build.link != tile.pos())
            && this.positionsValid(tile.x, tile.y, other.x, other.y);
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
phaseSpaceBridge.buildVisibility = BuildVisibility.shown;
phaseSpaceBridge.category = Category.distribution;
phaseSpaceBridge.size = 1;
phaseSpaceBridge.health = 220;
phaseSpaceBridge.hasItems = true;
phaseSpaceBridge.hasLiquids = true;
phaseSpaceBridge.outputsLiquid = true;
phaseSpaceBridge.itemCapacity = 25;
phaseSpaceBridge.liquidCapacity = 20;
phaseSpaceBridge.liquidPressure = 1.2;
phaseSpaceBridge.range = 15;
phaseSpaceBridge.transportTime = 0.01;
phaseSpaceBridge.requirements = ItemStack.with(
    Items.metaglass, 15,
    Items.silicon, 5,
    Items.titanium, 8,
    Items.phaseFabric, 15,
    items.dimensionShard, 20
);
phaseSpaceBridge.consumes.power(0.5);

Events.on(BlockBuildBeginEvent, cons(e => {
    if (Vars.player != null && Vars.player.unit() == e.unit && e.tile.block() != phaseSpaceBridge) {
        phaseSpaceBridge.lastBuild = null;
    }
}));

lib.setBuildingSimple(phaseSpaceBridge, ItemBridge.ItemBridgeBuild, block => ({

    playerPlaced(config) {
        this.super$playerPlaced(config);
        globalLastBuildTime = Time.time;
    },
    drawConfigure() {
        let entity = this;
        let tile = this.tile;
        let block = this.block;
        let x = this.x;
        let y = this.y;

        Draw.color(Pal.accent);
        Lines.stroke(1);
        Lines.square(x, y, block.size * Vars.tilesize / 2 + 1);

        let target;
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
        let entity = this;

        let other = Vars.world.tile(entity.link);
        if (!this.block.linkValid(tile, other)) return;
        let otherBuild = other.build;
        if (otherBuild == null) { return; }

        let opacity = Core.settings.getInt("bridgeopacity") / 100;
        if (Mathf.zero(opacity)) return;

        // draw it

        let angle = Angles.angle(tile.worldx(), tile.worldy(), other.worldx(), other.worldy());
        Draw.color(Color.white, Color.black, Mathf.absin(Time.time, 6, 0.07));
        Draw.alpha(Math.max(entity.uptime, 0.25) * opacity);

        Draw.rect(this.block.endRegion, this.x, this.y, angle + 90);
        Draw.rect(this.block.endRegion, otherBuild.x, otherBuild.y, angle + 270);

        Lines.stroke(8);
        Lines.line(this.block.bridgeRegion, tile.worldx(), tile.worldy(), other.worldx(), other.worldy(), false);

        let dist = Math.max(Math.abs(other.x - tile.x), Math.abs(other.y - tile.y));

        let time = entity.time2 / 1.7;
        let arrows = (dist) * tilesize / 4 - 2;

        Draw.color();

        for (let a = 0; a < arrows; a++) {
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

        let entity = this;
        let other = Vars.world.tile(entity.link);

        if (this.block.linkValid(tile, other)) {
            return this.items.total() < itemCapacity;
        } else {
            return source.block == this.block && source.link == tile.pos() && this.items.total() < itemCapacity;
        }

    },
    updateTile() {
        this.super$updateTile();
        // Try dump liquid if not be connected
        let entity = this;
        let tile = this.tile;
        let other = Vars.world.tile(entity.link);
        if (!this.block.linkValid(tile, other)) {
            this.dumpLiquid(entity.liquids.current());
        }
    },
    acceptLiquid(source, liquid) {
        if (this.team != source.team || !this.block.hasLiquids) return false;

        let entity = this;
        let tile = this.tile;
        let other = Vars.world.tile(entity.link);

        if (this.block.linkValid(tile, other)) {
            return true;
        } else if (!(source.block == this.block && source.link == tile.pos())) {
            return false;
        }

        return this.liquids.get(liquid) < this.block.liquidCapacity
            && (this.liquids.current() == liquid || this.liquids.get(this.liquids.current()) < 0.2);
    },
    updateTransport(other) {
        let entity = this;

        if (entity.uptime >= 0.5 && entity.timer.get(this.block.timerTransport, this.block.transportTime)) {
            // transport items
            let item = entity.items.take();
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
    checkDump(to){
        let other = Vars.world.tile(this.link);
        return (!this.block.linkValid(this.tile, other, false));
    }
}));

exports.phaseSpaceBridge = phaseSpaceBridge;
