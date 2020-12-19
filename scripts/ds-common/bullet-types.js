const lib = require('abomb4/lib');
const items = require('ds-common/items');
const {
    ionLiquid
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

const transparentColor = new Color(255, 255, 255, 0);
/**
 * options 支持：
 * 基础属性 damage speed width height
 */
exports.newElectricStormBulletType = (requestOptions) => {
    const tmp = new Vec2();
    const tmp2 = new Vec2();

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

    const fxLightningLine = new Effect(8, 500, cons(e => {
        Lines.stroke(3 * e.fout());
        Draw.color(e.color, Color.white, e.fin());

        Lines.line(e.data.p1x, e.data.p1y, e.data.p2x, e.data.p2y, false);
        Fill.circle(e.data.p1x, e.data.p1y, Lines.getStroke() / 2);
        Fill.circle(e.data.p2x, e.data.p2y, Lines.getStroke() / 2);
    }));

    const mergedOptions = Object.assign({
        damage: 40,
        speed: 3,
        lifetime: 180,
        pierceCap: 10,
        pierce: true,
        pierceBuilding: false,
        width: 20,
        height: 20,
        shrinkY: 0,
        shrinkX: 0,
        homingDelay: 30,
        homingPower: 0.025,
        homingRange: 200,
        splashDamageRadius: 38,
        splashDamage: 12,
        weaveMag: 8,
        weaveScale: 6,
        spin: 32.31234,
        lightning: 6,
        lightningLength: 10,
        lightningLengthRand: 6,
        lightningCone: 360,
        lightningAngle: 0,
        lightningDamage: 20,
        lightningColor: Color.valueOf("69dcee"),
        backColor: transparentColor,
        frontColor: Color.valueOf("79ecfe"),

        // custom
        accelerate: 0.25,
        speedStart: 1,
        speedFull: 5,
        flyingLightninColor: Color.valueOf("69dcee"),
        flyingLightningDamage: 18,
        flyingLightningChange: 0.06,
        flyingLightningLength: 8,
        flyingLightningCooldown: 5,
    }, requestOptions);

    const shouldDisableAnimation = () => Core.graphics.getFramesPerSecond() <= 50;
    const v = new JavaAdapter(BasicBulletType, {
        init(b) {
            if (!b) { return; }
            if (!b.data) { b.data = {}; }
            var speedStart = mergedOptions.speedStart * (b.vel.len() / this.speed);
            b.vel.trns(b.vel.angle(), speedStart);
            b.data.speed = speedStart;
            b.data.homingSpeedUp = 0;
            b.data.flyingLightningCooldown = mergedOptions.flyingLightningCooldown;
            b.data.animationDisabled = shouldDisableAnimation();
        },
        update(b) {
            if (this.homingPower >= 0.0001 && b.time >= this.homingDelay) {
                // var acceleratePercent = (b.data.speed - mergedOptions.speedStart) / (mergedOptions.speedFull - mergedOptions.speedStart)
                if (!b.data.target) {
                    b.data.target = Units.closestTarget(b.team, b.x, b.y, this.homingRange, boolf(e => (e.isGrounded() && this.collidesGround) || (e.isFlying() && this.collidesAir), boolf(t => this.collidesGround)));
                }

                if (b.data.target) {
                    // 1/4 seconds to increase homing power
                    b.vel.setAngle(Mathf.slerpDelta(b.rotation(), b.angleTo(b.data.target), this.homingPower + (Math.max(0, b.data.homingSpeedUp - 15)) * this.homingPower));
                    // accelerate bullet
                    b.data.speed = Math.min(b.data.speed + mergedOptions.accelerate, mergedOptions.speedFull);
                    b.vel.trns(b.vel.angle(), b.data.speed);
                    b.data.homingSpeedUp += 1;
                }
            }

            if (b.data.target && b.dst(b.data.target) <= 5) {
                b.remove();
                return;
            }

            if (this.weaveMag > 0) {
                var scl = Mathf.randomSeed(this.id, 0.9, 1.1);
                b.vel.rotate(Mathf.sin(b.time + Mathf.PI * this.weaveScale / 2 * scl, this.weaveScale * scl, this.weaveMag) * Time.delta);
            }

            if (this.trailChance > 0) {
                if (Mathf.chanceDelta(this.trailChance)) {
                    this.trailEffect.at(b.x, b.y, this.trailParam, this.trailColor);
                }
            }

            if (mergedOptions.flyingLightningChange > 0 && b.data.flyingLightningCooldown <= 0) {
                if (Mathf.chanceDelta(mergedOptions.flyingLightningChange)) {
                    for (var i = 0; i < mergedOptions.lightning / 2; i++) {
                        Lightning.create(b, mergedOptions.lightningColor, mergedOptions.flyingLightningDamage, b.x, b.y, Mathf.range(360), mergedOptions.flyingLightningLength);
                    }
                    b.data.flyingLightningCooldown = mergedOptions.flyingLightningCooldown;
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
                    tmp.trns(angle, radius + Mathf.range(radiusRandom));
                    tmp2.trns(angle2, radius + Mathf.range(radiusRandom));

                    fxLightningLine.at(b.x, b.y, 0, this.lightningColor, {
                        p1x: b.x + tmp.x,
                        p1y: b.y + tmp.y,
                        p2x: b.x + tmp2.x,
                        p2y: b.y + tmp2.y,
                    });
                }
            }

            b.data.flyingLightningCooldown = Math.max(b.data.flyingLightningCooldown - 1, 0);
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
        fragBullet: exports.newElectricStormBulletType({
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

const createDirectLightning = (() => {
    const random = new Rand();
    const rect = new Rect();
    const entities = new Seq();
    const hit = new IntSet();
    const maxChain = 8;
    const hitRange = 30;
    var bhit = false;
    var lastSeed = 0;

    const raycaster = func => new World.Raycaster({
        accept: func
    });
    return (hitter, team, color, damage, x, y, rotation, length) => {

        const originRotation = rotation;
        const originX = x;
        const originY = y;
        const seed = lastSeed++;

        random.setSeed(seed);
        hit.clear();

        var hitCreate = hitter == null || hitter.type.lightningType == null ? Bullets.damageLightning : hitter.type.lightningType;
        var lines = new Seq();
        var hitted = false;
        bhit = false;

        for (var i = 0; i < length / 2; i++) {
            hitCreate.create(null, team, x, y, 0, damage, 1, 1, hitter);
            lines.add(new Vec2(x + Mathf.range(3), y + Mathf.range(3)));

            if (lines.size > 1) {
                bhit = false;
                var from = lines.get(lines.size - 2);
                var to = lines.get(lines.size - 1);
                Vars.world.raycastEach(World.toTile(from.getX()), World.toTile(from.getY()), World.toTile(to.getX()), World.toTile(to.getY()), raycaster((wx, wy) => {

                    var tile = Vars.world.tile(wx, wy);
                    if (tile != null && tile.block().insulated && tile.team() != team) {
                        bhit = true;
                        //snap it instead of removing
                        lines.get(lines.size - 1).set(wx * tilesize, wy * tilesize);
                        return true;
                    }
                    return false;
                }));
                if (bhit) break;
            }

            rect.setSize(hitRange).setCenter(x, y);
            entities.clear();
            if (hit.size < maxChain) {
                Units.nearbyEnemies(team, rect, cons(u => {
                    if (!hit.contains(u.id) && (hitter == null || u.checkTarget(hitter.type.collidesAir, hitter.type.collidesGround))) {
                        entities.add(u);
                    }
                }));
            }

            var furthest = Geometry.findFurthest(x, y, entities);

            if (furthest != null) {
                hitted = true;
                hit.add(furthest.id);
                x = furthest.x;
                y = furthest.y;
            } else if (hitted) {
                rotation += random.range(30);
                x += Angles.trnsx(rotation, hitRange / 2);
                y += Angles.trnsy(rotation, hitRange / 2);
            } else {
                // rotation in range
                var randRotate = (() => {
                    // left or right?
                    var nowAngle = Tmp.v1.set(x - originX, y - originY).angle();
                    var angleOffset = nowAngle - originRotation;
                    var length = Tmp.v1.len();

                    var offsetLength = Mathf.sinDeg(angleOffset) * length;
                    // var lengthPercent = Math.min(1, Math.abs(offsetLength) / hitRange) * offsetLength > 0 ? 1 : -1;
                    var lengthPercent = offsetLength / hitRange;

                    return random.range(10) - lengthPercent * 20;
                })();

                rotation += randRotate;
                x += Angles.trnsx(rotation, hitRange / 2);
                y += Angles.trnsy(rotation, hitRange / 2);
            }
        }

        Fx.lightning.at(x, y, rotation, color, lines);
    };
})();

exports.createDirectLightningTeam = (team, color, damage, x, y, targetAngle, length) => createDirectLightning(
    null, team, color, damage, x, y, targetAngle, length
);

exports.createDirectLightning = (bullet, color, damage, x, y, targetAngle, length) => createDirectLightning(
    bullet, bullet.team, color, damage, x, y, targetAngle, length
);

// UnitTypes.gamma.weapons.get(0).bullet = (() => {
//     const s = new JavaAdapter(LightningBulletType, {
//         init(b) {
//             b && create(b, this.lightningColor, this.damage, b.x, b.y, b.rotation(), this.lightningLength + Mathf.random(this.lightningLengthRand));
//         },
//     });

//     s.damage = 20;
//     s.lightningLength = 100;
//     return s;
// })();
