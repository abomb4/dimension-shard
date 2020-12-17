const lib = require('abomb4/lib');
const items = require('ds-common/items');
const dsGlobal = require('ds-common/ds-global');

var block = extend(Drill, 'hard-thorium-drill', {
    load() {
        this.super$load();
        this.rotatorRegion = lib.loadRegion('hard-thorium-drill-rotator');
        this.rotatorRegion.packedHeight += 10;
        this.rotatorRegion.packedWidth -= 102;
    },
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
block.buildVisibility = BuildVisibility.shown;
block.size = 4;
block.health = 800;
block.liquidCapacity = 300;
block.requirements = ItemStack.with(
    Items.copper, 200,
    Items.graphite, 140,
    Items.titanium, 100,
    items.hardThoriumAlloy, 120,
    items.timeCrystal, 50,
);
block.category = Category.production;

block.drillTime = 144;
block.drawRim = true;
block.hasPower = true;
block.canOverdrive = false;
block.tier = 9;
block.updateEffect = Fx.pulverizeRed;
block.updateEffectChance = 0.01;
block.drillEffect = Fx.mineHuge;
block.rotateSpeed = 2;
block.warmupSpeed = 0.01;
block.hardnessDrillMultiplier = 30;
block.liquidBoostIntensity = 3;
block.consumes.power(8);
block.consumes.liquid(Liquids.water, 2.5).boost();

exports.hardThoriumDrill = block;
