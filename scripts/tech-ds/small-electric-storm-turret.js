const lib = require('abomb4/lib');
const items = require('ds-common/items');
const {
    dimensionAlloy
} = items;

const {
    newElectricStormBulletType
} = require('ds-common/bullet-types');

const turret = extend(ItemTurret, "small-electric-storm-turret", {

});

turret.ammo(dimensionAlloy, newElectricStormBulletType({
    speedStart: 0.7,
    homingDelay: 60,
}));
