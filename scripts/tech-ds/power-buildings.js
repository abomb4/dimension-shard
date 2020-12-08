const lib = require('abomb4/lib');
const items = require('ds-common/items');

const dsGlobal = require('ds-common/ds-global');

var dimensionCrystalBattery = extend(Battery, 'dimension-crystal-battery', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
});
dimensionCrystalBattery.buildVisibility = BuildVisibility.shown;
dimensionCrystalBattery.size = 3;
dimensionCrystalBattery.requirements = ItemStack.with(
    Items.lead, 160,
    Items.silicon, 80,
    Items.titanium, 80,
    items.spaceCrystal, 60,
    items.timeCrystal, 30
);
dimensionCrystalBattery.category = Category.power;
dimensionCrystalBattery.consumes.powerBuffered(Blocks.batteryLarge.consumes.getPower().capacity * 10);

exports.dimensionCrystalBattery = dimensionCrystalBattery;


var timeCompressedRtg = extend(DecayGenerator, 'time-compressed-rtg', {
    isHidden() { return !dsGlobal.techDsAvailable(); },
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
    items.spaceCrystal, 90,
    items.timeCrystal, 150,
    items.hardThoriumAlloy, 50 * rtgItemMultipler / 2
);
timeCompressedRtg.category = Category.power;
timeCompressedRtg.powerProduction = Blocks.rtgGenerator.powerProduction * rtgMultipler;
timeCompressedRtg.itemDuration = Blocks.rtgGenerator.itemDuration / (rtgMultipler * (7 / 8));
timeCompressedRtg.canOverdrive = false;

exports.timeCompressedRtg = timeCompressedRtg;
