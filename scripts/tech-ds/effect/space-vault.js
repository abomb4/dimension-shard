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

const block = new JavaAdapter(StorageBlock, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
}, 'space-vault');

block.buildVisibility = BuildVisibility.shown;
block.category = Category.effect;
block.size = 3;
block.health = 600;
block.itemCapacity = Blocks.vault.itemCapacity * 5;
block.flags = EnumSet.of(BlockFlag.storage);
block.requirements = ItemStack.with(
    Items.titanium, 400,
    Items.thorium, 30,
    Items.phaseFabric, 80,
    items.spaceCrystal, 140,
    items.hardThoriumAlloy, 130,
);

exports.spaceVault = block;
