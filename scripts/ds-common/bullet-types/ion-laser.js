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

const lib = require('abomb4/lib');
const { newElectricStormBulletType } = require('ds-common/bullet-types/electric-storm-bullet-type');
const items = require('ds-common/items');
const { ionLiquid } = items;

const BULLET_PROPERTIES = [
    'absorbable', 'ammoMultiplier', 'backColor', 'backMove', 'backRegion',
    'collides', 'collidesAir', 'collidesGround', 'collidesTeam', 'collidesTiles',
    'damage', 'despawnEffect', 'despawnShake', 'drag', 'drawSize',
    'fragAngle', 'fragBullet', 'fragBullets', 'fragCone', 'fragLifeMax',
    'fragLifeMin', 'fragVelocityMax', 'fragVelocityMin', 'frontColor', 'frontRegion',
    'healPercent', 'height', 'hitColor', 'hitEffect', 'hitShake',
    'hitSize', 'hitSound', 'hittable', 'homingDelay', 'homingPower',
    'homingRange', 'inaccuracy', 'incendAmount', 'incendChance', 'incendSpread',
    'instantDisappear', 'keepVelocity', 'killShooter', 'knockback', 'lifetime',
    'lightColor', 'lightOpacity', 'lightRadius', 'lightning', 'lightningAngle',
    'lightningColor', 'lightningCone', 'lightningDamage', 'lightningLength', 'lightningLengthRand',
    'lightningType', 'makeFire', 'maxRange', 'mixColorFrom', 'mixColorTo',
    'pierce', 'pierceBuilding', 'pierceCap', 'puddleAmount', 'puddleLiquid',
    'puddleRange', 'puddles', 'recoil', 'reflectable', 'reloadMultiplier',
    'scaleVelocity', 'shootEffect', 'shrinkX', 'shrinkY', 'smokeEffect',
    'speed', 'spin', 'splashDamage', 'splashDamageRadius', 'sprite',
    'status', 'statusDuration', 'tileDamageMultiplier', 'trailChance', 'trailColor',
    'trailEffect', 'trailParam', 'weaveMag', 'weaveScale', 'width',
];
const LASER_BULLET_PROPERTIES = [
    'laserEffect', 'length', 'lengthFalloff', 'sideLength',
    'sideAngle', 'lightningSpacing', 'largeHit',
].concat(BULLET_PROPERTIES);

const standardIonLaserFrag = newElectricStormBulletType({
    lifetime: 20,
    speedStart: 2.5,
    damage: 1,
    pierceCap: 2,
    splashDamage: 1,
    splashDamageRadius: 24,
    lightning: 1,
    lightningLength: 3,
    lightningDamage: 8,
    lightningColor: ionLiquid.color,
    frontColor: ionLiquid.color,
    flyingLightningDamage: 12,
    flyingLightninColor: ionLiquid.color,
    flyingLightningChange: 0.07,
    flyingLightningDelay: 5,
})


exports.newIonLaserBulletType = (requestOptions) => {

    const mergedOptions = Object.assign({
        length: 460,
        damage: 560,
        width: 75,
        lifetime: 65,
        lightningSpacing: 30,
        lightningLength: 6,
        lightningDelay: 1.1,
        lightningLengthRand: 16,
        lightningDamage: 50,
        lightningAngleRand: 40,
        lightningColor: ionLiquid.color,
        lightColor: ionLiquid.color,
        largeHit: true,
        shootEffect: Fx.none,
        fragBullets: 1,
        fragBullet: standardIonLaserFrag,
        fragLifeMin: 0,
        fragLifeMax: 0.3,
        collidesTeam: false,
        sideAngle: 15,
        sideWidth: 0,
        sideLength: 0,
        status: items.ionBurningEffect,
        statusDuration: 120,
        colors: [ (() => {let c = ionLiquid.color.cpy(); c.a = 0.4; return c; })(), ionLiquid.color, Color.white ],
        overrides: {},
    }, requestOptions);

    const v = new JavaAdapter(LaserBulletType, Object.assign({
    }, mergedOptions.overrides), mergedOptions.damage);

    for (let p of LASER_BULLET_PROPERTIES) {
        let value = mergedOptions[p];
        if (value !== undefined && value !== null) {
            v[p] = value;
        }
    }
    v.colors[0] = mergedOptions.colors[0];
    v.colors[1] = mergedOptions.colors[1];
    v.colors[2] = mergedOptions.colors[2];
    return v;
};

exports.largeIonLaser = exports.newIonLaserBulletType({
});
