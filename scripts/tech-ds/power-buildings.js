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

let dimensionCrystalBattery = extend(Battery, 'dimension-crystal-battery', {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
});
dimensionCrystalBattery.buildVisibility = BuildVisibility.shown;
dimensionCrystalBattery.size = 1;
dimensionCrystalBattery.requirements = ItemStack.with(
    Items.lead, 120,
    Items.silicon, 60,
    Items.titanium, 60,
    items.spaceCrystal, 80,
    items.timeCrystal, 10
);
dimensionCrystalBattery.category = Category.power;
dimensionCrystalBattery.health = 180;
dimensionCrystalBattery.consumes.powerBuffered(Blocks.batteryLarge.consumes.getPower().capacity * 3);

exports.dimensionCrystalBattery = dimensionCrystalBattery;


let timeCompressedRtg = extend(DecayGenerator, 'time-compressed-rtg', {
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
});
const rtgMultipler = 12;
const rtgItemMultipler = 10;
timeCompressedRtg.buildVisibility = BuildVisibility.shown;
timeCompressedRtg.size = 3;
timeCompressedRtg.requirements = ItemStack.with(
    Items.lead, 100 * rtgItemMultipler,
    Items.silicon, 75 * rtgItemMultipler,
    Items.phaseFabric, 25 * rtgItemMultipler,
    Items.plastanium, 75 * rtgItemMultipler,
    items.dimensionShard, 50 * rtgItemMultipler / 2,
    items.spaceCrystal, 120,
    items.timeCrystal, 180,
    items.hardThoriumAlloy, 50 * rtgItemMultipler / 2
);
timeCompressedRtg.category = Category.power;
timeCompressedRtg.powerProduction = Blocks.rtgGenerator.powerProduction * rtgMultipler;
timeCompressedRtg.itemDuration = Blocks.rtgGenerator.itemDuration / (rtgMultipler - 1);
timeCompressedRtg.canOverdrive = false;
timeCompressedRtg.heatColor = Color.valueOf("ffc4b7");

exports.timeCompressedRtg = timeCompressedRtg;
