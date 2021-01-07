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
const blockTypes = require('abomb4/block-types');

const items = require('ds-common/items');
const {
    dimensionShard, spaceCrystal, timeCrystal, hardThoriumAlloy,
    dimensionAlloy, timeFlow, ionLiquid
} = items;
const dsGlobal = require('ds-common/ds-global');

// -=-=-=-=-=-=-=-=-=-=-=- Shard Receiver -=-=-=-=-=-=-=-=-=-=-=-
const shardReceiver = extend(GenericSmelter, "shard-receiver", {
});
shardReceiver.size = 4;
// shardReceiver.health = 600;
shardReceiver.requirements = ItemStack.with(
    Items.metaglass, 160,
    Items.silicon, 60,
    Items.thorium, 120,
    Items.phaseFabric, 150,
    Items.surgeAlloy, 30,
);
shardReceiver.buildVisibility = BuildVisibility.shown;
shardReceiver.category = Category.crafting;

shardReceiver.craftEffect = Fx.smeltsmoke;
shardReceiver.outputItem = new ItemStack(dimensionShard, 1);
shardReceiver.craftTime = 300;
shardReceiver.hasPower = true;
shardReceiver.flameColor = dimensionShard.color;
shardReceiver.itemCapacity = 10;
shardReceiver.boostScale = 2;
shardReceiver.consumes.power(7);

exports.shardReceiver = shardReceiver;

// -=-=-=-=-=-=-=-=-=-=-=- Space Crystallizer -=-=-=-=-=-=-=-=-=-=-=-
const spaceCrystallizer = extend(AttributeSmelter, "space-crystallizer", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
spaceCrystallizer.size = 2;
// spaceCrystallizer.health = 600;
spaceCrystallizer.requirements = ItemStack.with(
    Items.lead, 120,
    Items.silicon, 40,
    Items.thorium, 80,
    Items.phaseFabric, 30,
    dimensionShard, 70
);
spaceCrystallizer.buildVisibility = BuildVisibility.shown;
spaceCrystallizer.category = Category.crafting;

spaceCrystallizer.craftEffect = Fx.smeltsmoke;
spaceCrystallizer.outputItem = new ItemStack(spaceCrystal, 2);
spaceCrystallizer.craftTime = 90;
spaceCrystallizer.hasPower = true;
spaceCrystallizer.flameColor = spaceCrystal.color;
spaceCrystallizer.itemCapacity = 20;
spaceCrystallizer.boostScale = 0.15;

spaceCrystallizer.consumes.items(ItemStack.with(
    dimensionShard, 3,
    Items.silicon, 1,
    Items.phaseFabric, 1
));
spaceCrystallizer.consumes.power(2);

exports.spaceCrystallizer = spaceCrystallizer;


// -=-=-=-=-=-=-=-=-=-=-=- Hard Thorium Alloy Slelter -=-=-=-=-=-=-=-=-=-=-=-
const hardThoriumAlloySmelter = extend(GenericSmelter, "hard-thorium-alloy-smelter", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
hardThoriumAlloySmelter.size = 3;
// hardThoriumAlloySmelter.health = 600;
hardThoriumAlloySmelter.requirements = ItemStack.with(
    Items.copper, 120,
    Items.graphite, 40,
    Items.thorium, 160,
    dimensionShard, 110,
    spaceCrystal, 80
);
hardThoriumAlloySmelter.buildVisibility = BuildVisibility.shown;
hardThoriumAlloySmelter.category = Category.crafting;

hardThoriumAlloySmelter.craftEffect = Fx.smeltsmoke;
hardThoriumAlloySmelter.outputItem = new ItemStack(hardThoriumAlloy, 2);
hardThoriumAlloySmelter.craftTime = 90;
hardThoriumAlloySmelter.hasPower = true;
hardThoriumAlloySmelter.hasLiquids = false;
hardThoriumAlloySmelter.flameColor = hardThoriumAlloy.color;
hardThoriumAlloySmelter.itemCapacity = 20;

hardThoriumAlloySmelter.consumes.items(ItemStack.with(
    spaceCrystal, 1,
    Items.graphite, 3,
    Items.thorium, 5
));
hardThoriumAlloySmelter.consumes.power(3);

exports.hardThoriumAlloySmelter = hardThoriumAlloySmelter;


// -=-=-=-=-=-=-=-=-=-=-=- Time Condenser -=-=-=-=-=-=-=-=-=-=-=-
exports.timeCondenser = blockTypes.newLiquidConverter({
    name: 'time-condenser',
    convertRatio: 2,
    size: 2,
    requirements: ItemStack.with(
        Items.lead, 100,
        Items.silicon, 70,
        dimensionShard, 160,
        hardThoriumAlloy, 90
    ),
    category: Category.crafting,
    craftEffect: Fx.smeltsmoke,
    outputLiquid: new LiquidStack(timeFlow, 0.2),
    craftTime: 100,
    hasPower: true,
    consumes: consumes => {
        consumes.items(ItemStack.with(
            dimensionShard, 4,
            Items.phaseFabric, 2,
        ));
        consumes.liquid(Liquids.cryofluid, 0.1);
        consumes.power(3);
    },
    blockOverrides: {
        isHidden() { return !dsGlobal.techDsAvailable(); },
    },
});


// -=-=-=-=-=-=-=-=-=-=-=- Time Crystallizer -=-=-=-=-=-=-=-=-=-=-=-
const timeCrystallizer = extend(AttributeSmelter, "time-crystallizer", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
timeCrystallizer.size = 3;
// timeCrystallizer.health = 600;
timeCrystallizer.requirements = ItemStack.with(
    Items.titanium, 120,
    Items.phaseFabric, 100,
    Items.surgeAlloy, 20,
    dimensionShard, 160,
    spaceCrystal, 80
);
timeCrystallizer.buildVisibility = BuildVisibility.shown;
timeCrystallizer.category = Category.crafting;

timeCrystallizer.attribute = Attribute.water;
timeCrystallizer.craftEffect = Fx.smeltsmoke;
timeCrystallizer.outputItem = new ItemStack(timeCrystal, 1);
timeCrystallizer.craftTime = 60;
timeCrystallizer.hasPower = true;
timeCrystallizer.flameColor = timeCrystal.color;
timeCrystallizer.itemCapacity = 20;
timeCrystallizer.boostScale = 0.2;

timeCrystallizer.consumes.items(ItemStack.with(
    Items.plastanium, 2
));
timeCrystallizer.consumes.power(2.5);
timeCrystallizer.consumes.liquid(timeFlow, 0.1);
exports.timeCrystallizer = timeCrystallizer;


// -=-=-=-=-=-=-=-=-=-=-=- Radioisotope Weaver -=-=-=-=-=-=-=-=-=-=-=-
const radioisotopeWeaver = extend(GenericSmelter, "radioisotope-weaver", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
radioisotopeWeaver.size = 3;
// radioisotopeWeaver.health = 600;
radioisotopeWeaver.requirements = ItemStack.with(
    Items.silicon, 180,
    dimensionShard, 70,
    spaceCrystal, 80,
    hardThoriumAlloy, 160
);
radioisotopeWeaver.buildVisibility = BuildVisibility.shown;
radioisotopeWeaver.category = Category.crafting;

radioisotopeWeaver.craftEffect = Fx.smeltsmoke;
radioisotopeWeaver.outputItem = new ItemStack(Items.phaseFabric, 2);
radioisotopeWeaver.craftTime = 80;
radioisotopeWeaver.hasPower = true;
radioisotopeWeaver.flameColor = Items.phaseFabric.color;
radioisotopeWeaver.itemCapacity = 50;
radioisotopeWeaver.ambientSound = Sounds.techloop;
radioisotopeWeaver.ambientSoundVolume = 0.02;

radioisotopeWeaver.consumes.items(ItemStack.with(
    dimensionShard, 6,
    Items.sand, 18
));
radioisotopeWeaver.consumes.power(10);
exports.radioisotopeWeaver = radioisotopeWeaver;


// -=-=-=-=-=-=-=-=-=-=-=- Ion Collector -=-=-=-=-=-=-=-=-=-=-=-
exports.ionCollector = blockTypes.newLiquidConverter({
    name: 'ion-collector',
    convertRatio: 1.5,
    size: 3,
    requirements: ItemStack.with(
        Items.lead, 300,
        Items.plastanium, 100,
        Items.surgeAlloy, 50,
        dimensionShard, 60,
        timeCrystal, 30,
        hardThoriumAlloy, 180
    ),
    category: Category.crafting,
    craftEffect: Fx.smeltsmoke,
    outputLiquid: new LiquidStack(ionLiquid, 0.2),
    craftTime: 90,
    hasPower: true,
    consumes: consumes => {
        consumes.items(ItemStack.with(
            Items.surgeAlloy, 1,
        ));
        consumes.liquid(timeFlow, 0.1);
        consumes.power(7);
    },
    blockOverrides: {
        isHidden() { return !dsGlobal.techDsAvailable(); },
    },
});

// -=-=-=-=-=-=-=-=-=-=-=- Dimension Alloy Smelter -=-=-=-=-=-=-=-=-=-=-=-
const dimensionAlloySmelter = extend(GenericSmelter, "dimension-alloy-smelter", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
dimensionAlloySmelter.size = 4;
// dimensionAlloySmelter.health = 600;
dimensionAlloySmelter.requirements = ItemStack.with(
    Items.copper, 300,
    Items.silicon, 220,
    Items.surgeAlloy, 80,
    spaceCrystal, 100,
    hardThoriumAlloy, 200,
    timeCrystal, 100
);
dimensionAlloySmelter.buildVisibility = BuildVisibility.shown;
dimensionAlloySmelter.category = Category.crafting;

dimensionAlloySmelter.craftEffect = Fx.smeltsmoke;
dimensionAlloySmelter.outputItem = new ItemStack(dimensionAlloy, 1);
dimensionAlloySmelter.craftTime = 90;
dimensionAlloySmelter.hasPower = true;
dimensionAlloySmelter.flameColor = dimensionAlloy.color;
dimensionAlloySmelter.itemCapacity = 20;

dimensionAlloySmelter.consumes.items(ItemStack.with(
    spaceCrystal, 4,
    timeCrystal, 3,
    Items.surgeAlloy, 2
));
dimensionAlloySmelter.consumes.liquid(ionLiquid, 0.1);
dimensionAlloySmelter.consumes.power(8);
exports.dimensionAlloySmelter = dimensionAlloySmelter;
