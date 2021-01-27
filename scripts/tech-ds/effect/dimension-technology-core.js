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
const { electron } = require('tech-ds/unit/core1-electron');

const block = extend(CoreBlock, "dimension-technology-core", {
});
block.buildVisibility = BuildVisibility.shown;
block.category = Category.effect;
block.size = 6;
block.health = 10000;
block.itemCapacity = 24000;
block.unitCapModifier = 34;
block.researchCostMultiplier = 0.08;
block.unitType = electron;

block.requirements = ItemStack.with(
    Items.copper, 15000,
    Items.lead, 15000,
    Items.silicon, 8000,
    Items.thorium, 6000,
    Items.phaseFabric, 3000,
    items.dimensionShard, 6000,
);

exports.dimensionTechnologyCore4 = block;
