
// -=-=-=-=-=-=-=-=-=-=- Modification of origin turrets -=-=-=-=-=-=-=-=-=-=-
const lib = require('abomb4/lib');
const items = require('ds-common/items');
const {
    dimensionShard,
    spaceCrystal,
    timeCrystal,
    hardThoriumAlloy,
    dimensionAlloy,
    timeFlow,
    ionLiquid
} = items;

// -=-=-=-=-=-=-=-=-=-=-=-= Dimension Shard =-=-=-=-=-=-=-=-=-=-=-=-
const fxDimensionShardExplosion = lib.newEffect(24, e => {
    Draw.color(items.dimensionShardColorLight);

    e.scaled(7, cons(i => {
        Lines.stroke(3 * i.fout());
        Lines.circle(e.x, e.y, 3 + i.fin() * 24);
    }));

    Draw.color(Color.gray);

    Angles.randLenVectors(e.id, 7, 2 + 28 * e.finpow(), lib.floatc2((x, y) => {
        Fill.circle(e.x + x, e.y + y, e.fout() * 4 + 0.5);
    }));

    Draw.color(items.dimensionShardColor);
    Lines.stroke(1 * e.fout());

    Angles.randLenVectors(e.id + 1, 4, 1 + 25 * e.finpow(), lib.floatc2((x, y) => {
        Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 3);
    }));
});

Blocks.scatter.ammoTypes.put(dimensionShard, (() => {
    const v = new FlakBulletType(4.2, 12);
    v.lifetime = 70;
    v.ammoMultiplier = 2;
    v.shootEffect = Fx.shootSmall;
    v.width = 6;
    v.height = 8;
    v.hitEffect = fxDimensionShardExplosion;
    v.splashDamage = 30;
    v.splashDamageRadius = 28;
    v.knockback = 0.6;
    v.reloadMultiplier = 0.6;
    v.frontColor = items.dimensionShardColor
    v.backColor = items.dimensionShardColorLight
    // v.status = StatusEffects.blasted;
    return v;
})());

Blocks.cyclone.ammoTypes.put(dimensionShard, (() => {
    const v = new FlakBulletType(4.2, 15);
    v.lifetime = 60;
    v.ammoMultiplier = 2;
    v.shootEffect = Bullets.fragExplosive.shootEffect;
    v.width = 8;
    v.height = 10;
    v.hitEffect = fxDimensionShardExplosion;
    v.splashDamage = 36;
    v.splashDamageRadius = 34;
    v.knockback = 0.6;
    v.reloadMultiplier = 0.8;
    v.frontColor = items.dimensionShardColor
    v.backColor = items.dimensionShardColorLight
    v.collidesGround = true;
    // v.status = StatusEffects.blasted;
    return v;
})());

Blocks.ripple.ammoTypes.put(dimensionShard, (() => {
    const v = new ArtilleryBulletType(2, 20);
    v.lifetime = 80;
    v.ammoMultiplier = 2;
    v.width = v.height = 13;
    v.hitEffect = fxDimensionShardExplosion;
    v.splashDamage = 45;
    v.splashDamageRadius = 40;
    v.knockback = 2;
    v.reloadMultiplier = 0.8;
    v.frontColor = items.dimensionShardColor
    v.backColor = items.dimensionShardColorLight
    v.collidesTiles = false;
    // v.status = StatusEffects.blasted;
    return v;
})());

// -=-=-=-=-=-=-=-=-=-=-=-= Hard Thorium Alloy =-=-=-=-=-=-=-=-=-=-=-=-

Blocks.salvo.ammoTypes.put(hardThoriumAlloy, (() => {
    const v = new BasicBulletType(4, 44);
    v.lifetime = Bullets.standardThorium.lifetime;
    v.ammoMultiplier = 4;
    v.width = Bullets.standardThorium.width;
    v.height = Bullets.standardThorium.height * 1.4;
    v.frontColor = Bullets.standardThorium.frontColor.cpy().lerp(items.hardThoriumAlloyColor, 0.5);
    v.backColor = Bullets.standardThorium.backColor.cpy().lerp(items.hardThoriumAlloyColorLight, 0.5);
    v.pierceCap = 2;
    v.pierceBuilding = true;
    // v.status = StatusEffects.blasted;
    return v;
})());

Blocks.spectre.ammoTypes.put(hardThoriumAlloy, (() => {
    const v = new BasicBulletType(8, 125);
    v.lifetime = Bullets.standardThoriumBig.lifetime;
    v.knockback = Bullets.standardThoriumBig.knockback;
    v.shootEffect = Bullets.standardThoriumBig.shootEffect;
    v.width = Bullets.standardThoriumBig.width;
    v.height = Bullets.standardThoriumBig.height * 1.4;
    v.frontColor = Bullets.standardThoriumBig.frontColor.cpy().lerp(items.hardThoriumAlloyColor, 0.5);
    v.backColor = Bullets.standardThoriumBig.backColor.cpy().lerp(items.hardThoriumAlloyColorLight, 0.5);
    v.ammoMultiplier = 2;
    v.pierceCap = 4;
    v.pierceBuilding = true;
    // v.status = StatusEffects.blasted;
    return v;
})());

// -=-=-=-=-=-=-=-=-=-=-=-= Space Crystal =-=-=-=-=-=-=-=-=-=-=-=-

Blocks.foreshadow.ammoTypes.put(spaceCrystal, (() => {
    function percent(x, y, tx, ty, radius) {
        var dst = Mathf.dst(x, y, tx, ty);
        var falloff = 0.4;
        var scaled = Mathf.lerp(1 - dst / radius, 1, falloff);
        return scaled;
    }

    var fxShoot = lib.newEffect(24, e => {
        e.scaled(10, cons(b => {
            Draw.color(items.spaceCrystalColorLight, items.spaceCrystalColor, b.fin());
            Lines.stroke(b.fout() * 3 + 0.2);
            Lines.circle(b.x, b.y, b.fin() * 50);
        }));

        Draw.color(items.spaceCrystalColor);

        for(var i of Mathf.signs){
            Drawf.tri(e.x, e.y, 13 * e.fout(), 85, e.rotation + 90 * i);
            Drawf.tri(e.x, e.y, 13 * e.fout(), 50, e.rotation + 20 * i);
        }
    });
    var fxHoleBomb = new Effect(8, 80, cons(e => {
        e.scaled(7, cons(i => {
            Lines.stroke(3 * i.fout());
            Lines.circle(e.x, e.y, 3 + i.fin() * 60);
        }));

        Draw.color(items.spaceCrystalColor);

        Angles.randLenVectors(e.id, 6, 2 + 19 * e.finpow(), new Floatc2({get: (x, y) => {
            Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5);
            Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
        }}));

        Draw.color(items.spaceCrystalColor, items.spaceCrystalColorLight, items.spaceCrystalColorLight, e.fin());
        Lines.stroke(1.5 * e.fout());

        Angles.randLenVectors(e.id + 1, 8, 1 + 46 * e.finpow(), new Floatc2({get: (x, y) => {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
        }}));
    }));
    var fxHole = new Effect(70, 80, cons(e => {
        Draw.color(items.spaceCrystalColor, items.spaceCrystalColorLight, e.fout());
        Draw.alpha(0.5 * e.fin() + 0.5);
        Lines.stroke(e.fin() * 3);
        Lines.circle(e.x, e.y, Mathf.sin(e.fout()) * 60);

        Draw.color(items.spaceCrystalColor);
        Draw.alpha(0.8 * e.fout() + 0.2);
        Fill.circle(e.x, e.y, (1 - Math.abs(0.3 - e.fin())) * 6)
        Draw.alpha(Mathf.clamp(9 * e.fout(), 0, 1));
        Fill.circle(e.x, e.y, e.fout() * 1 + 5)
    }));
    var fxBlackTrail = new Effect(30, cons(e => {
        for(var i = 0; i < 2; i++){
            Draw.color(i == 0 ? items.spaceCrystalColorLight : items.spaceCrystalColor);

            var m = i == 0 ? 1 : 0.5;

            var rot = e.rotation + 180;
            var w = 15 * e.fout() * m;
            Drawf.tri(e.x, e.y, w, (30 + Mathf.randomSeedRange(e.id, 15)) * m, rot);
            Drawf.tri(e.x, e.y, w, 10 * m, rot + 180);
        }
    }));
    const v = new JavaAdapter(PointBulletType, {
        despawned(b) {
            if (b) {
                var counter = { count: 60 };
                var x = b.x;
                var y = b.y;
                var team = b.team;
                var rect = new Rect();
                rect.setSize(this.splashDamageRadius * 2).setCenter(x, y);
                var con = cons(unit => {
                    if (unit.team == team || !unit.within(x, y, this.splashDamageRadius)) {
                        return;
                    }
                    var p = percent(x, y, unit.getX(), unit.getY(), this.splashDamageRadius);
                    var amount = this.splashDamage / 60 * 1.2 * p
                    unit.damage(amount);

                    // drag
                    unit.impulse(Tmp.v3.set(unit).sub(x, y).nor().scl(this.knockback * p * 80));
                    unit.vel.limit(3);
                });

                var poo = run(() => {
                    if (counter.count > 0) {
                        Units.nearbyEnemies(team, rect, con);
                        Timer.schedule(poo, 0);
                    }
                    counter.count--;
                });
                poo.run();
                // Timer.schedule(run(() => Units.nearbyEnemies(b.team, rect, con)), 0, 0.02, 40);
                this.super$despawned(b);
            }
        }
    });
    v.shootEffect = fxShoot;
    v.hitEffect = fxHoleBomb;
    v.smokeEffect = Fx.smokeCloud;
    v.trailEffect = fxBlackTrail;
    v.despawnEffect = fxHole;
    v.trailSpacing = 20;
    v.damage = 50;
    v.tileDamageMultiplier = 0.5;
    v.speed = 500;
    v.hitShake = 8;
    v.ammoMultiplier = 1;
    v.reloadMultiplier = 0.6;
    v.hitSize = 100;
    v.splashDamageRadius = 80;
    v.splashDamage = 100;
    v.knockback = -0.55;
    return v;
})());

// -=-=-=-=-=-=-=-=-=-=-=-= Liquids =-=-=-=-=-=-=-=-=-=-=-=-

Blocks.wave.ammoTypes.put(timeFlow, (() => {
    const v = new LiquidBulletType(timeFlow);
    v.knockback = 1;
    v.drag = 0.03;
    return v;
})());
Blocks.tsunami.ammoTypes.put(timeFlow, (() => {
    const v = new LiquidBulletType(timeFlow);
    v.lifetime = 49;
    v.speed = 4;
    v.knockback = 2;
    v.puddleSize = 8;
    v.drag = 0.001;
    v.ammoMultiplier = 0.4;
    v.statusDuration = 60 * 4;
    v.damage = 0.4;
    return v;
})());

Blocks.wave.ammoTypes.put(ionLiquid, (() => {
    const v = new LiquidBulletType(ionLiquid);
    v.knockback = 1;
    v.damage = 20;
    v.drag = 0.03;
    return v;
})());
Blocks.tsunami.ammoTypes.put(ionLiquid, (() => {
    const v = new LiquidBulletType(ionLiquid);
    v.lifetime = 49;
    v.speed = 4;
    v.knockback = 1.3;
    v.puddleSize = 8;
    v.drag = 0.001;
    v.ammoMultiplier = 0.4;
    v.statusDuration = 60 * 4;
    v.damage = 25;
    return v;
})());
