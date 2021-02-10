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

var rotatorLightRegion;
const block = extend(Drill, 'hard-thorium-drill', {
    load() {
        this.super$load();
        rotatorLightRegion = lib.loadRegion('hard-thorium-drill-rotator-light');
        this.rotatorRegion = lib.loadRegion('hard-thorium-drill-rotator');
        this.rotatorRegion.packedHeight += 10;
        this.rotatorRegion.packedWidth -= 102;
    },
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
            return;
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
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
block.drawMineItem = true;
block.hasPower = true;
block.canOverdrive = false;
block.tier = 9;
block.updateEffect = Fx.pulverizeRed;
block.updateEffectChance = 0.01;
block.drillEffect = Fx.mine;
block.rotateSpeed = 4;
block.warmupSpeed = 0.01;
block.heatColor = Color.valueOf("9a48ff");
block.hardnessDrillMultiplier = 25;
block.liquidBoostIntensity = 3;
block.consumes.power(8);
block.consumes.liquid(Liquids.water, 2).boost();

const lightColor = Color.valueOf("9a48ff")
lib.setBuildingSimple(block, Drill.DrillBuild, block => ({
    lightup: 0,
    updateTile() {
        if (this.dominantItem == null) {
            return;
        }
        if (this.timer.get(block.timerDump, block.dumpTime)) {
            this.dump(this.dominantItem);
            this.dump(this.dominantItem);
        }
        this.timeDrilled += this.warmup * this.delta();

        if (this.items.total() < block.itemCapacity && this.dominantItems > 0 && this.consValid()) {

            var speed = 1;

            if (this.cons.optionalValid()) {
                speed = block.liquidBoostIntensity;
                this.lightup = Mathf.lerpDelta(this.lightup, 1, block.warmupSpeed);
            } else {
                this.lightup = Mathf.lerpDelta(this.lightup, 0, block.warmupSpeed);
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
            this.lightup = Mathf.lerpDelta(this.lightup, 0, block.warmupSpeed);
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

            block.drillEffect.at(this.x + Mathf.range(block.size) * 2, this.y + Mathf.range(block.size) * 2, this.dominantItem.color);
        }
    },
    draw() {
        var s = 0.3
        var ts = 0.6
        Draw.rect(block.region, this.x, this.y)
        this.drawCracks()
        if (block.drawRim) {
            Draw.color(block.heatColor);
            Draw.alpha(this.warmup * ts * (1 - s + Mathf.absin(Time.time, 3, s)));
            Draw.blend(Blending.additive);
            Draw.rect(block.rimRegion, this.x, this.y);
            Draw.blend();
            Draw.color();
        }
        Draw.rect(block.rotatorRegion, this.x, this.y, this.timeDrilled * block.rotateSpeed);

        Draw.rect(block.topRegion, this.x, this.y);

        if (this.dominantItem != null && this.drawMineItem) {
            Draw.color(this.dominantItem.color);
            Draw.rect(block.itemRegion, this.x, this.y);
            Draw.color();
        }

        Draw.z(Layer.effect);
        Draw.color(lightColor);
        Draw.alpha(this.lightup * 0.9);
        Draw.rect(rotatorLightRegion, this.x, this.y, this.timeDrilled * block.rotateSpeed);
        Draw.reset();
    },
}));
exports.hardThoriumDrill = block;
