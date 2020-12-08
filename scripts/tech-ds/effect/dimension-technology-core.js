const lib = require('abomb4/lib');
const items = require('ds-common/items');

const block = extend(CoreBlock, "dimension-technology-core", {
});
block.buildVisibility = BuildVisibility.shown;
block.category = Category.effect;
block.size = 6;
block.health = 8500;
block.itemCapacity = 18000;
block.unitCapModifier = 30;
block.researchCostMultiplier = 0.08;
block.unitType = UnitTypes.gamma;

block.requirements = ItemStack.with(
    Items.copper, 10000,
    Items.lead, 10000,
    Items.silicon, 6000,
    Items.thorium, 4000,
    Items.phaseFabric, 1000,
    items.dimensionShard, 4000,
);

exports.dimensionTechnologyCore = block;
