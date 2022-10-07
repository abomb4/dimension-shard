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

const block = new JavaAdapter(OverdriveProjector, {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
}, 'time-overdrive');

block.hasLiquid = true;
block.liquidCapacity = 20;
block.buildVisibility = BuildVisibility.shown;
block.category = Category.effect;
block.size = 3;
block.requirements = ItemStack.with(
    Items.lead, 400,
    Items.silicon, 220,
    Items.titanium, 240,
    Items.plastanium, 150,
    Items.surgeAlloy, 200,
    items.timeCrystal, 100,
);

block.range = 180;
block.phaseRangeBoost = 40;
block.speedBoost = 2.2;
block.speedBoostPhase = 1.8;
block.useTime = 180;
block.hasBoost = true;
block.consumePower(15);
block.consumeLiquid(items.timeFlow, 0.1).boost();

exports.timeOverdrive = block;
