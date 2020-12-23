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

var block = extend(Drill, 'hard-thorium-drill', {
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

block.drillTime = 144;
block.drawRim = true;
block.hasPower = true;
block.canOverdrive = false;
block.tier = 9;
block.updateEffect = Fx.pulverizeRed;
block.updateEffectChance = 0.01;
block.drillEffect = Fx.mineHuge;
block.rotateSpeed = 2;
block.warmupSpeed = 0.01;
block.hardnessDrillMultiplier = 30;
block.liquidBoostIntensity = 3;
block.consumes.power(8);
block.consumes.liquid(Liquids.water, 2.5).boost();

exports.hardThoriumDrill = block;
