const lib = require('abomb4/lib');
const blockTypes = require('abomb4/block-types');

const items = require('ds-common/items');
const {
    dimensionAlloy
} = items;

const {
    newElectricStormBulletType
} = require('ds-common/bullet-types');

const turret = blockTypes.newNoRotatingTurret({
    name: 'electric-storm-turret',
    turretType: ItemTurret,
});

turret.ammo(dimensionAlloy, newElectricStormBulletType({
    speedStart: 0.7,
    homingDelay: 30,
}));
