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
const items = require('ds-common/items');
const {
    ionLiquid
} = items;
const { newElectricStormBulletType } = require('ds-common/bullet-types/electric-storm-bullet-type');

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

exports.newIonBoltBulletType = (requestOptions) => {

    // const fxLightningBall = new Effect(10, 500, cons(e => {
    //     Lines.stroke(3 * e.fout());
    //     Draw.color(e.color, Color.white, e.fin());
    //     // select two point at circle, draw line between them
    //     const radius = 4;
    //     const radiusRandom = 12;
    //     for (var i = 0; i < 3; i++) {
    //         var angle = Mathf.range(360);
    //         var angle2 = Mathf.range(120) + 120;
    //         tmp.trns(angle, radius + Mathf.range(radiusRandom));
    //         tmp2.trns(angle2, radius + Mathf.range(radiusRandom));
    //         Lines.line(e.data.getX() + tmp.x, e.data.getY() + tmp.y, e.data.getX() + tmp2.x, e.data.getY() + tmp2.y, false);
    //         Fill.circle(e.data.getX() + tmp.x, e.data.getY() + tmp.y, Lines.getStroke() / 2);
    //         Fill.circle(e.data.getX() + tmp2.x, e.data.getY() + tmp2.y, Lines.getStroke() / 2);
    //     }
    // }));

    const fireEffect = new Effect(8, cons(e => {
        Draw.color(Color.white, ionLiquid.color, e.fin());
        Lines.stroke(0.5 + e.fout());
        Lines.circle(e.x, e.y, e.fin() * 5);
    }));

    const mergedOptions = Object.assign({
        damage: 30,
        speed: 5.2,
        lifetime: 48,
        width: 4,
        height: 11,
        shrinkY: 0,
        shrinkX: 0,
        ammoMultiplier: 1,
        hitEffect: Fx.massiveExplosion,
        smokeEffect: fireEffect,
        despawnEffect: fireEffect,
        splashDamageRadius: 32,
        splashDamage: 30,
        lightning: 2,
        lightningLength: 6,
        lightningLengthRand: 4,
        lightningCone: 360,
        lightningAngle: 90,
        lightningDamage: 20,
        lightningColor: ionLiquid.color,
        puddles: 3,
        puddleRange: 8,
        puddleAmount: 8,
        puddleLiquid: ionLiquid,
        status: items.ionBurningEffect,
        statusDuration: 120,
        fragBullets: 1,
        fragBullet: newElectricStormBulletType({
            lifetime: 20,
            speedStart: 2.5,
            damage: 1,
            pierceCap: 2,
            splashDamage: 1,
            splashDamageRadius: 24,
            lightning: 2,
            lightningLength: 3,
            lightningDamage: 10,
            lightningColor: ionLiquid.color,
            frontColor: ionLiquid.color,
            flyingLightningDamage: 15,
            flyingLightninColor: ionLiquid.color,
            flyingLightningChange: 0.07,
            flyingLightningDelay: 5,
        }),
        backColor: ionLiquid.color,
        frontColor: ionLiquid.color,
    }, requestOptions);

    const v = new JavaAdapter(LaserBoltBulletType, {
    }, mergedOptions.speed, mergedOptions.damage);

    for (var p of BULLET_PROPERTIES) {
        var value = mergedOptions[p];
        if (value !== undefined && value !== null) {
            v[p] = value;
        }
    }
    return v;
};

exports.standardIonBolt1 = exports.newIonBoltBulletType({
    fragBullets: 0,
    height: 8,
    damage: 20,
    lightningDamage: 16,
    lightningLength: 5,
    lightningLengthRand: 0,
    splashDamageRadius: 26,
    hitEffect: Fx.explosion,
    puddles: 1,
    puddleAmount: 6,
});

exports.standardIonBolt2 = exports.newIonBoltBulletType({
    fragBullets: 1,
    height: 9,
    damage: 25,
    lightningDamage: 18,
    lightningLength: 5,
    lightningLengthRand: 0,
    splashDamageRadius: 28,
    hitEffect: Fx.explosion,
    puddles: 1,
    puddleAmount: 8,
});

exports.standardIonBolt = exports.newIonBoltBulletType({
});
