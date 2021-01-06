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

const block = extend(Drill, 'hard-thorium-drill', {
    load() {
        this.super$load();
        this.rotatorRegion = lib.loadRegion('hard-thorium-drill-rotator');
        this.rotatorRegion.packedHeight += 10;
        this.rotatorRegion.packedWidth -= 102;
    },
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
block.buildVisibility = BuildVisibility.shown;
block.size = 4;
block.health = 800;
block.liquidCapacity = 300;
block.requirements = ItemStack.with(
    Items.copper, 200,
    Items.graphite, 140,
    Items.titanium, 100,
    items.hardThoriumAlloy, 120,
    items.timeCrystal, 50,
);
block.category = Category.production;

block.drillTime = 100;
block.drawRim = true;
block.hasPower = true;
block.canOverdrive = false;
block.tier = 9;
block.updateEffect = Fx.pulverizeRed;
block.updateEffectChance = 0.01;
block.drillEffect = Fx.mineHuge;
block.rotateSpeed = 2;
block.warmupSpeed = 0.01;
block.hardnessDrillMultiplier = 25;
block.liquidBoostIntensity = 3;
block.consumes.power(8);
block.consumes.liquid(Liquids.water, 2.5).boost();

lib.setBuildingSimple(block, Drill.DrillBuild, {

    updateTile() {
        if (this.dominantItem == null) {
            return;
        }
        if (this.timer.get(block.timerDump, block.dumpTime)) {
            this.dump(this.dominantItem);
            this.dump(this.dominantItem);
            this.dump(this.dominantItem);
            this.dump(this.dominantItem);
            this.dump(this.dominantItem);
            this.dump(this.dominantItem);
        }
        this.timeDrilled += this.warmup * this.delta();

        if (this.items.total() < block.itemCapacity && this.dominantItems > 0 && this.consValid()) {

            var speed = 1;

            if (this.cons.optionalValid()) {
                speed = block.liquidBoostIntensity;
            }

            speed *= this.efficiency(); // Drill slower when not at full power

            this.lastDrillSpeed = (speed * this.dominantItems * this.warmup) / (block.drillTime + block.hardnessDrillMultiplier * this.dominantItem.hardness);
            this.warmup = Mathf.lerpDelta(this.warmup, speed, block.warmupSpeed);
            this.progress += this.delta() * this.dominantItems * speed * this.warmup;

            if (Mathf.chanceDelta(block.updateEffectChance * this.warmup)) {
                block.updateEffect.at(this.x + Mathf.range(block.size * 2), this.y + Mathf.range(block.size * 2));
            }
        } else {
            this.lastDrillSpeed = 0;
            this.warmup = Mathf.lerpDelta(this.warmup, 0, block.warmupSpeed);
            return;
        }

        var delay = block.drillTime + block.hardnessDrillMultiplier * this.dominantItem.hardness;

        if (this.dominantItems > 0 && this.progress >= delay && this.items.total() < block.itemCapacity) {
            const offloadTimes = Math.floor(this.progress / delay);
            for (var i = 0; i < offloadTimes; i++) {
                this.offload(this.dominantItem);
            }

            this.index++;
            this.progress %= delay;

            block.drillEffect.at(this.x + Mathf.range(block.size), this.y + Mathf.range(block.size), this.dominantItem.color);
        }
    },

});
exports.hardThoriumDrill = block;
