const lib = require('abomb4/lib');
const items = require('ds-common/items');

const block = new JavaAdapter(OverdriveProjector, {
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

block.consumes.power(15);
block.size = 3;
block.range = 180;
block.phaseRangeBoost = 40;
block.speedBoost = 2.2;
block.speedBoostPhase = 1.8;
block.useTime = 180;
block.hasBoost = true;
block.consumes.liquid(items.timeFlow, 0.1).boost();
