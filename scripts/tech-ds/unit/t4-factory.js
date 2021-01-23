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
const { formula } = require('tech-ds/unit/ast4-formula');
const { burn } = require('tech-ds/unit/aat4-burn');
const { beat } = require('tech-ds/unit/gat4-beat');

const block = extend(Reconstructor, 'dimension-t4-reconstructor', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
block.buildVisibility = BuildVisibility.shown;
block.size = 7;
block.liquidCapacity = 100;
block.requirements = ItemStack.with(
    Items.lead, 2000,
    Items.silicon, 1000,
    Items.plastanium, 500,
    items.dimensionShard, 1200,
    items.hardThoriumAlloy, 500,
    items.spaceCrystal, 400,
    items.timeCrystal, 150,
);
block.category = Category.units;
block.constructTime = 60 * 60 * 1.5;

block.consumes.power(13);
block.consumes.items(ItemStack.with(
    Items.silicon, 900,
    items.hardThoriumAlloy, 700,
    items.spaceCrystal, 420,
    items.timeCrystal, 330
));
block.consumes.liquid(items.ionLiquid, 0.5);

block.upgrades.addAll(
    lib.createUnitPlan(UnitTypes.mega, formula),
    lib.createUnitPlan(UnitTypes.zenith, burn),
    lib.createUnitPlan(UnitTypes.fortress, beat),
);
exports.t4Factory = block;
