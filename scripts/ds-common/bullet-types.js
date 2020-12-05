const lib = require('abomb4/lib');
const items = require('ds-common/items');
const {
    dimensionAlloy
} = items;

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

/**
 * options 支持：
 * 基础属性 damage speed width height
 */
exports.newElectricStormBulletType = (requestOptions) => {
    const tmp = new Vec2();
    const tmp2 = new Vec2();

    const mergedOptions = Object.assign({
        damage: 12,
        speed: 3,
        accelerate: 0.2,
        speedStart: 1,
        speedFull: 6,
        lifetime: 180,
        pierceCap: 10,
        pierce: true,
        pierceBuilding: false,
        width: 8,
        height: 8,
        shrinkY: 0,
        shrinkX: 0,
        homingDelay: 30,
        homingPower: 0.025,
        homingRange: 500,
        splashDamageRadius: 48,
        splashDamage: 20,
        lightning: 8,
        lightningLength: 8,
        lightningLengthRand: 5,
        lightningCone: 360,
        lightningAngle: 0,
        lightningDamage: 18,
        lightningColor: Color.valueOf("69dcee"),
        lightningChance: 0.1,
        lightningCooldown: 10,
        // hitEffect: Fx.sapExplosion,
        backColor: new Color(255, 255, 255, 0),
        frontColor: new Color(200, 200, 200, 1),
    }, requestOptions);

    const v = new JavaAdapter(BasicBulletType, {
        init(b) {
            if (!b) { return; }
            if (!b.data) { b.data = {}; }
            var speedStart = mergedOptions.speedStart * (b.vel.len() / this.speed);
            b.vel.trns(b.vel.angle(), speedStart);
            b.data.speed = speedStart;
            b.data.homingSpeedUp = 0;
            b.data.lightningCooldown = mergedOptions.lightningCooldown;
        },
        update(b) {
            if (this.homingPower >= 0.0001 && b.time >= this.homingDelay) {
                // var acceleratePercent = (b.data.speed - mergedOptions.speedStart) / (mergedOptions.speedFull - mergedOptions.speedStart)
                if (b.data.target == null) {
                    b.data.target = Units.closestTarget(b.team, b.x, b.y, this.homingRange, boolf(e => (e.isGrounded() && this.collidesGround) || (e.isFlying() && this.collidesAir), boolf(t => this.collidesGround)));
                }

                if (b.data.target != null) {
                    // 1/4 seconds to increase homing power
                    b.vel.setAngle(Mathf.slerpDelta(b.rotation(), b.angleTo(b.data.target), this.homingPower + (Math.max(0, b.data.homingSpeedUp - 15)) * this.homingPower) );
                    // accelerate bullet
                    b.data.speed = Mathf.clamp(b.data.speed + mergedOptions.accelerate, 0, mergedOptions.speedFull);
                    b.vel.trns(b.vel.angle(), b.data.speed);
                    b.data.homingSpeedUp += 1;
                }
            }

            if (b.data.target && b.dst(b.data.target) <= 6) {
                b.remove();
                return;
            }

            if (this.trailChance > 0) {
                if (Mathf.chanceDelta(this.trailChance)) {
                    this.trailEffect.at(b.x, b.y, this.trailParam, this.trailColor);
                }
            }

            if (mergedOptions.lightningChance > 0 && b.data.lightningCooldown <= 0) {
                if (Mathf.chanceDelta(mergedOptions.lightningChance)) {
                    for (var i = 0; i < mergedOptions.lightning / 2; i++) {
                        var rot = b.rotation() + Mathf.range(mergedOptions.lightningCone) + mergedOptions.lightningAngle;
                        tmp.trns(rot, Mathf.random(mergedOptions.height / 2));
                        Lightning.create(
                            b,
                            mergedOptions.lightningColor,
                            mergedOptions.lightningDamage < 0 ? mergedOptions.damage : mergedOptions.lightningDamage,
                            b.x + tmp.x,
                            b.y + tmp.y,
                            rot,
                            mergedOptions.lightningLength + Mathf.random(mergedOptions.lightningLengthRand)
                        );
                    }
                    b.data.lightningCooldown = mergedOptions.lightningCooldown;
                }
            }
            for (var i = 0; i < 2; i++) {
                var rot = b.rotation() + Mathf.range(180);
                tmp.trns(rot, mergedOptions.height);
                var rot2 = b.rotation() + Mathf.range(180);
                tmp2.trns(rot2, mergedOptions.height / 4);
                tmp.add(tmp2);
                Lightning.create(
                    b,
                    mergedOptions.lightningColor,
                    mergedOptions.lightningDamage < 0 ? mergedOptions.damage : mergedOptions.lightningDamage / 4,
                    b.x + tmp.x,
                    b.y + tmp.y,
                    tmp.inv().angle(),
                    4
                );
            }

            b.data.lightningCooldown = Math.max(b.data.lightningCooldown - 1, 0);
        },
    }, mergedOptions.speed, mergedOptions.damage, lib.modName + '-electric-storm');

    for (var p of BULLET_PROPERTIES) {
        var value = mergedOptions[p];
        if (value !== undefined && value !== null) {
            v[p] = value;
        }
    }
    return v;
};
