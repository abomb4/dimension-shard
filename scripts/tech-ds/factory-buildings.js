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
    Items.silicon, 60,
    Items.thorium, 120,
    Items.phaseFabric, 150,
    Items.surgeAlloy, 30,
);
shardReceiver.buildVisibility = BuildVisibility.shown;
shardReceiver.category = Category.crafting;

shardReceiver.craftEffect = Fx.smeltsmoke;
shardReceiver.outputItem = new ItemStack(dimensionShard, 1);
shardReceiver.craftTime = 150;
shardReceiver.hasPower = true;
shardReceiver.flameColor = dimensionShard.color;
shardReceiver.itemCapacity = 10;
shardReceiver.boostScale = 0.15;
shardReceiver.consumes.power(3.5);

exports.shardReceiver = shardReceiver;

// -=-=-=-=-=-=-=-=-=-=-=- Space Crystallizer -=-=-=-=-=-=-=-=-=-=-=-
const spaceCrystallizer = extend(AttributeSmelter, "space-crystallizer", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
spaceCrystallizer.size = 3;
// spaceCrystallizer.health = 600;
spaceCrystallizer.requirements = ItemStack.with(
    Items.lead, 250,
    Items.silicon, 100,
    Items.thorium, 120,
    Items.phaseFabric, 30,
    dimensionShard, 200
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
    Items.phaseFabric, 2
));
spaceCrystallizer.consumes.power(6);

exports.spaceCrystallizer = spaceCrystallizer;


// -=-=-=-=-=-=-=-=-=-=-=- Hard Thorium Alloy Slelter -=-=-=-=-=-=-=-=-=-=-=-
const hardThoriumAlloySmelter = extend(GenericSmelter, "hard-thorium-alloy-smelter", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
hardThoriumAlloySmelter.size = 3;
// hardThoriumAlloySmelter.health = 600;
hardThoriumAlloySmelter.requirements = ItemStack.with(
    Items.copper, 400,
    Items.graphite, 200,
    Items.thorium, 300,
    Items.plastanium, 140,
    dimensionShard, 320,
    spaceCrystal, 100
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
hardThoriumAlloySmelter.consumes.power(6);

exports.hardThoriumAlloySmelter = hardThoriumAlloySmelter;


// -=-=-=-=-=-=-=-=-=-=-=- Time Condenser -=-=-=-=-=-=-=-=-=-=-=-
const timeCondenser = extend(LiquidConverter, "time-condenser", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
timeCondenser.size = 3;
// timeCondenser.health = 600;
timeCondenser.requirements = ItemStack.with(
    Items.lead, 300,
    Items.silicon, 150,
    dimensionShard, 200,
    hardThoriumAlloy, 120
);
timeCondenser.buildVisibility = BuildVisibility.shown;
timeCondenser.category = Category.crafting;
timeCondenser.itemCapacity = 20;

timeCondenser.craftEffect = Fx.smeltsmoke;
timeCondenser.outputLiquid = new LiquidStack(timeFlow, 0.2);
timeCondenser.craftTime = 60;
timeCondenser.hasPower = true;

timeCondenser.consumes.items(ItemStack.with(
    dimensionShard, 6,
    Items.phaseFabric, 2,
));
timeCondenser.consumes.liquid(Liquids.cryofluid, 0.2);
timeCondenser.consumes.power(6);
exports.timeCondenser = timeCondenser;


// -=-=-=-=-=-=-=-=-=-=-=- Time Crystallizer -=-=-=-=-=-=-=-=-=-=-=-
const timeCrystallizer = extend(AttributeSmelter, "time-crystallizer", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
timeCrystallizer.size = 3;
// timeCrystallizer.health = 600;
timeCrystallizer.requirements = ItemStack.with(
    Items.lead, 500,
    Items.graphite, 300,
    Items.titanium, 320,
    Items.phaseFabric, 160,
    Items.surgeAlloy, 100,
    dimensionShard, 400,
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
timeCrystallizer.consumes.power(6);
timeCrystallizer.consumes.liquid(timeFlow, 0.2);
exports.timeCrystallizer = timeCrystallizer;


// -=-=-=-=-=-=-=-=-=-=-=- Radioisotope Weaver -=-=-=-=-=-=-=-=-=-=-=-
const radioisotopeWeaver = extend(GenericSmelter, "radioisotope-weaver", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
radioisotopeWeaver.size = 3;
// radioisotopeWeaver.health = 600;
radioisotopeWeaver.requirements = ItemStack.with(
    Items.lead, 400,
    Items.silicon, 220,
    dimensionShard, 200,
    spaceCrystal, 50,
    hardThoriumAlloy, 140
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
const ionCollector = extend(LiquidConverter, "ion-collector", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
ionCollector.size = 3;
// ionCollector.health = 600;
ionCollector.requirements = ItemStack.with(
    Items.lead, 300,
    Items.silicon, 150,
    dimensionShard, 200,
    hardThoriumAlloy, 120
);
ionCollector.buildVisibility = BuildVisibility.shown;
ionCollector.category = Category.crafting;

ionCollector.craftEffect = Fx.smeltsmoke;
ionCollector.outputLiquid = new LiquidStack(ionLiquid, 0.1);
ionCollector.craftTime = 60;
ionCollector.hasPower = true;

ionCollector.consumes.items(ItemStack.with(
    Items.surgeAlloy, 1,
));
ionCollector.consumes.liquid(timeFlow, 0.2);
ionCollector.consumes.power(7);
exports.ionCollector = ionCollector;


// -=-=-=-=-=-=-=-=-=-=-=- Dimension Alloy Smelter -=-=-=-=-=-=-=-=-=-=-=-
const dimensionAlloySmelter = extend(GenericSmelter, "dimension-alloy-smelter", {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
dimensionAlloySmelter.size = 4;
// dimensionAlloySmelter.health = 600;
dimensionAlloySmelter.requirements = ItemStack.with(
    Items.copper, 600,
    Items.lead, 500,
    Items.silicon, 420,
    spaceCrystal, 200,
    hardThoriumAlloy, 340,
    timeCrystal, 120
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
dimensionAlloySmelter.consumes.liquid(ionLiquid, 0.2);
dimensionAlloySmelter.consumes.power(8);
exports.dimensionAlloySmelter = dimensionAlloySmelter;
