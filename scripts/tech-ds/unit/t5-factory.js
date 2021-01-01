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
const { equa } = require('tech-ds/unit/ast5-equa');
const { collapse } = require('tech-ds/unit/aat5-collapse');
const { formula } = require('tech-ds/unit/ast4-formula');
const { burn } = require('tech-ds/unit/aat4-burn');
const { beat } = require('tech-ds/unit/gat4-beat');
const { rhapsody } = require('tech-ds/unit/gat5-rhapsody');

const block = extend(Reconstructor, 'dimension-t5-reconstructor', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
block.buildVisibility = BuildVisibility.shown;
block.size = 9;
block.liquidCapacity = 180;
block.requirements = ItemStack.with(
    Items.lead, 5000,
    Items.silicon, 3000,
    Items.surgeAlloy, 300,
    items.hardThoriumAlloy, 800,
    items.spaceCrystal, 600,
    items.timeCrystal, 300,
    items.dimensionAlloy, 200,
);
block.category = Category.units;
block.constructTime = 60 * 60 * 4;

block.consumes.power(25);
block.consumes.items(ItemStack.with(
    Items.silicon, 1000,
    items.hardThoriumAlloy, 600,
    items.spaceCrystal, 300,
    items.timeCrystal, 200,
    items.dimensionAlloy, 100,
));
block.consumes.liquid(items.ionLiquid, 1);

block.upgrades.addAll(
    lib.createUnitPlan(UnitTypes.quad, equa),
    lib.createUnitPlan(formula, equa),
    lib.createUnitPlan(UnitTypes.antumbra, collapse),
    lib.createUnitPlan(burn, collapse),
    lib.createUnitPlan(UnitTypes.scepter, rhapsody),
    lib.createUnitPlan(beat, rhapsody),
);
exports.t5Factory = block;
