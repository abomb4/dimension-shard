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

const transparentColor = new Color(255, 255, 255, 0);

exports.newSurroundingElectricBall = (requestOptions) => {

    const options = Object.assign({
        damage: 20,
        lifetime: 180,
        pierceCap: 4,
        pierce: true,
        pierceBuilding: false,
        width: 30,
        height: 30,
        shrinkY: 0,
        shrinkX: 0,
        homingDelay: 0,
        homingPower: 0,
        homingRange: 0,
        splashDamageRadius: 36,
        splashDamage: 30,
        weaveMag: 8,
        weaveScale: 6,
        spin: 6,
        lightning: 2,
        lightningLength: 8,
        lightningLengthRand: 8,
        lightningCone: 360,
        lightningAngle: 0,
        lightningDamage: 22,
        lightningColor: Color.valueOf("69dcee"),
        backColor: transparentColor,
        frontColor: Color.valueOf("79ecfe"),

        // custom
        angleSpeed: 5.5,
        radiusSpeed: 64 / 30,
        radius: 64,
        flyingLightninColor: Color.valueOf("69dcee"),
        flyingLightningDamage: 18,
        flyingLightningChange: 0.07,
        flyingLightningLength: 10,
        flyingLightningCooldown: 7,
    }, requestOptions);

    const fxLightningLine = new Effect(8, 500, cons(e => {
        Lines.stroke(3 * e.fout());
        Draw.color(e.color, Color.white, e.fin());

        Lines.line(e.data.p1x, e.data.p1y, e.data.p2x, e.data.p2y, false);
        Fill.circle(e.data.p1x, e.data.p1y, Lines.getStroke() / 2);
        Fill.circle(e.data.p2x, e.data.p2y, Lines.getStroke() / 2);
    }));

    const shouldDisableAnimation = () => Core.graphics.getFramesPerSecond() <= 50;
    const v = new JavaAdapter(BasicBulletType, {
        init(b) {
            if (!b) { return; }
            if (!b.data) { b.data = {}; }
            // no spped
            b.data.flyingLightningCooldown = options.flyingLightningCooldown;
            b.data.animationDisabled = shouldDisableAnimation();
            b.data.center = b.owner ? b.owner : new Vec2(b.x, b.y);
            b.data.baseRad = b.rotation();
            b.data.rotation = 0;
            b.data.len = 0;
            b.vel.setZero();
        },
        update(b) {
            // Calculate rotate end position and move to
            Tmp.v1.trns(b.data.baseRad + b.data.rotation, b.data.len)
                .add(b.data.center.x, b.data.center.y)
                .sub(b.x, b.y);
            b.move(Tmp.v1.x, Tmp.v1.y);

            if (this.trailChance > 0) {
                if (Mathf.chanceDelta(this.trailChance)) {
                    this.trailEffect.at(b.x, b.y, this.trailParam, this.trailColor);
                }
            }

            if (options.flyingLightningChange > 0 && b.data.flyingLightningCooldown <= 0) {
                if (Mathf.chanceDelta(options.flyingLightningChange)) {
                    for (var i = 0; i < options.lightning / 2; i++) {
                        Lightning.create(b, options.lightningColor, options.flyingLightningDamage, b.x, b.y, Mathf.range(360), options.flyingLightningLength);
                    }
                    b.data.flyingLightningCooldown = options.flyingLightningCooldown;
                }
            }

            if (!Vars.headless && Core.settings.getBool("bloom") && !Core.settings.getBool("pixelate") && !b.data.animationDisabled) {
                // effect
                b.data.animationDisabled = shouldDisableAnimation();
                const radius = 4;
                const radiusRandom = 12;
                for (var i = 0; i < 3; i++) {
                    var angle = Mathf.range(360);
                    var angle2 = Mathf.range(120) + 120;
                    Tmp.v1.trns(angle, radius + Mathf.range(radiusRandom));
                    Tmp.v2.trns(angle2, radius + Mathf.range(radiusRandom));

                    fxLightningLine.at(b.x, b.y, 0, this.lightningColor, {
                        p1x: b.x + Tmp.v1.x,
                        p1y: b.y + Tmp.v1.y,
                        p2x: b.x + Tmp.v2.x,
                        p2y: b.y + Tmp.v2.y,
                    });
                }
            }

            b.data.flyingLightningCooldown = Math.max(b.data.flyingLightningCooldown - 1, 0);
            b.data.len = Math.min(b.data.len + options.radiusSpeed * Time.delta, options.radius);
            b.data.rotation += options.angleSpeed * Time.delta;
            b.data.rotation %= 360;
        },
    }, 0.1, options.damage, lib.modName + '-surrounding-electric-ball');

    for (var p of BULLET_PROPERTIES) {
        var value = options[p];
        if (value !== undefined && value !== null) {
            v[p] = value;
        }
    }
    v.speed = options.radius / options.lifetime * 1.1;
    v.keepVelocity = true;
    return v;
};
