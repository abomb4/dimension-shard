const { newElectricStormBulletType } = require('ds-common/bullet-types/electric-storm-bullet-type');
const { newIonBoltBulletType, standardIonBolt1, standardIonBolt2, standardIonBolt } = require('ds-common/bullet-types/ion-bolt');
const { createDirectLightningTeam, createDirectLightning } = require('ds-common/bullet-types/direct-lightning');
const { blackHole, blackHoleDamaged, fxBlackHoleExplode } = require('ds-common/bullet-types/black-hole');

exports.newElectricStormBulletType = newElectricStormBulletType;
exports.newIonBoltBulletType = newIonBoltBulletType;
exports.standardIonBolt1 = standardIonBolt1;
exports.standardIonBolt2 = standardIonBolt2;
exports.standardIonBolt = standardIonBolt;
exports.createDirectLightningTeam = createDirectLightningTeam;
exports.createDirectLightning = createDirectLightning;
exports.blackHole = blackHole;
exports.blackHoleDamaged = blackHoleDamaged;
exports.fxBlackHoleExplode = fxBlackHoleExplode;
