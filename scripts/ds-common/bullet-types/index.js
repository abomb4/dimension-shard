// Copyright (C) 2020 abomb4
//
// This file is part of Dimension Shard.
//
// Dimension Shard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Dimension Shard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Dimension Shard.  If not, see <http://www.gnu.org/licenses/>.

const { newElectricStormBulletType } = require('ds-common/bullet-types/electric-storm-bullet-type');
const { newIonBoltBulletType, standardIonBolt1, standardIonBolt2, standardIonBolt } = require('ds-common/bullet-types/ion-bolt');
const { createDirectLightningTeam, createDirectLightning } = require('ds-common/bullet-types/direct-lightning');
const { blackHole, blackHoleDamaged, fxBlackHoleExplode } = require('ds-common/bullet-types/black-hole');
const { newSurroundingElectricBall } = require('ds-common/bullet-types/surrounding-electric-ball');
const { newIonLaserBulletType, largeIonLaser } = require('ds-common/bullet-types/ion-laser');

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
exports.newSurroundingElectricBall = newSurroundingElectricBall;
exports.newIonLaserBulletType = newIonLaserBulletType;
exports.largeIonLaser = largeIonLaser;
