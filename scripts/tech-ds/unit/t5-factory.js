const lib = require('abomb4/lib');
const items = require('ds-common/items');
const dsGlobal = require('ds-common/ds-global');
const { equa } = require('tech-ds/unit/equa');
const { burn } = require('tech-ds/unit/burn');

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
block.consumes.liquid(items.ionLiquid, 2);

block.upgrades.addAll(
    lib.createUnitPlan(UnitTypes.quad, equa),
    lib.createUnitPlan(UnitTypes.antumbra, burn),
);
exports.t5Factory = block;
