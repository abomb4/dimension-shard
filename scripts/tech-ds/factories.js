const lib = require('abomb4/lib');
const blockTypes = require('abomb4/block-types');

const items = require('ds-common/items');
const {
    dimensionShard, spaceCrystal, timeCrystal, hardThoriumAlloy,
    dimensionAlloy, timeFlow, ionLiquid
} = items;

const spaceCrystallizer = extend(AttributeSmelter, "space-crystallizer", {});
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
spaceCrystallizer.liquidCapacity = 50;

spaceCrystallizer.craftEffect = Fx.smeltsmoke;
spaceCrystallizer.outputItem = new ItemStack(spaceCrystal, 1);
spaceCrystallizer.craftTime = 90;
spaceCrystallizer.hasPower = true;
spaceCrystallizer.flameColor = spaceCrystal.color;
spaceCrystallizer.itemCapacity = 20;
spaceCrystallizer.boostScale = 0.15;

spaceCrystallizer.consumes.items(ItemStack.with(
    dimensionShard, 4,
    Items.silicon, 1,
    Items.thorium, 1
));
spaceCrystallizer.consumes.power(6);
spaceCrystallizer.consumes.liquid(Liquids.water, 0.2);

exports.spaceCrystallizer = spaceCrystallizer;


const hardThoriumAlloySmelter = extend(GenericSmelter, "hard-thorium-alloy-smelter", {});
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


const timeCrystallizer = extend(AttributeSmelter, "time-crystallizer", {});
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
timeCrystallizer.liquidCapacity = 50;

timeCrystallizer.attribute = Attribute.water;
timeCrystallizer.craftEffect = Fx.smeltsmoke;
timeCrystallizer.outputItem = new ItemStack(timeCrystal, 1);
timeCrystallizer.craftTime = 150;
timeCrystallizer.hasPower = true;
timeCrystallizer.flameColor = timeCrystal.color;
timeCrystallizer.itemCapacity = 20;
timeCrystallizer.boostScale = 0.2;

timeCrystallizer.consumes.items(ItemStack.with(
    dimensionShard, 6,
    Items.plastanium, 2,
    Items.phaseFabric, 3
));
timeCrystallizer.consumes.power(10);
timeCrystallizer.consumes.liquid(Liquids.cryofluid, 0.3);

exports.timeCrystallizer = timeCrystallizer;
