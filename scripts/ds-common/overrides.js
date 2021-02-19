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


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=- Modification of origin turrets -=-=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
const lib = require('abomb4/lib');
const items = require('ds-common/items');
const bulletTypes = require('ds-common/bullet-types/index');
const { fxBlackHoleExplodeDamaged } = require('ds-common/bullet-types/black-hole');
const {
    dimensionShard,
    spaceCrystal,
    timeCrystal,
    hardThoriumAlloy,
    dimensionAlloy,
    timeFlow,
    ionLiquid,
    fxDimensionShardExplosion,
} = items;

// -=-=-=-=-=-=-=-=-=-=-=-= Dimension Shard =-=-=-=-=-=-=-=-=-=-=-=-

Blocks.scatter.ammoTypes.put(dimensionShard, (() => {
    const v = new FlakBulletType(4.2, 12);
    v.lifetime = 70;
    v.ammoMultiplier = 2;
    v.shootEffect = Fx.shootSmall;
    v.width = 6;
    v.height = 8;
    v.hitEffect = fxDimensionShardExplosion;
    v.splashDamage = 40;
    v.splashDamageRadius = 30;
    v.knockback = 0.6;
    v.reloadMultiplier = 0.6;
    v.frontColor = items.dimensionShardColorLight
    v.backColor = items.dimensionShardColor
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
    v.splashDamage = 46;
    v.splashDamageRadius = 34;
    v.knockback = 0.6;
    v.reloadMultiplier = 0.8;
    v.frontColor = items.dimensionShardColorLight
    v.backColor = items.dimensionShardColor
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
    v.splashDamage = 50;
    v.splashDamageRadius = 40;
    v.knockback = 2;
    v.reloadMultiplier = 0.8;
    v.frontColor = items.dimensionShardColorLight
    v.backColor = items.dimensionShardColor
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
    let fxShoot = lib.newEffect(24, e => {
        e.scaled(10, cons(b => {
            Draw.color(items.spaceCrystalColor, items.spaceCrystalColorLight, b.fin());
            Lines.stroke(b.fout() * 3 + 0.2);
            Lines.circle(b.x, b.y, b.fin() * 50);
        }));

        Draw.color(items.spaceCrystalColor);

        for (let i of Mathf.signs) {
            Drawf.tri(e.x, e.y, 13 * e.fout(), 85, e.rotation + 90 * i);
            Drawf.tri(e.x, e.y, 13 * e.fout(), 50, e.rotation + 20 * i);
        }
    });
    let fxBlackTrail = new Effect(30, cons(e => {
        for (let i = 0; i < 2; i++) {
            Draw.color(i == 0 ? items.spaceCrystalColor : items.spaceCrystalColorLight);

            let m = i == 0 ? 1 : 0.5;

            let rot = e.rotation + 180;
            let w = 15 * e.fout() * m;
            Drawf.tri(e.x, e.y, w, (30 + Mathf.randomSeedRange(e.id, 15)) * m, rot);
            Drawf.tri(e.x, e.y, w, 10 * m, rot + 180);
        }
    }));

    const v = new JavaAdapter(PointBulletType, {
        despawned(b) {
            if (b) {
                bulletTypes.blackHoleDamaged.create(b, b.x, b.y, 0);
                this.super$despawned(b);
            }
        }
    });
    v.shootEffect = fxShoot;
    v.hitEffect = fxBlackHoleExplodeDamaged;
    v.smokeEffect = Fx.smokeCloud;
    v.trailEffect = fxBlackTrail;
    // v.despawnEffect = fxHole;
    v.despawnEffect = Fx.none;
    v.trailSpacing = 20;
    v.damage = 0;
    v.tileDamageMultiplier = 0.5;
    v.speed = 500;
    v.hitShake = 8;
    v.ammoMultiplier = 1;
    v.reloadMultiplier = 0.6;
    v.hitSize = 100;
    v.splashDamageRadius = 80;
    v.splashDamage = 75;
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

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=- Modification of origin buildings -=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

Blocks.foreshadow.targetInterval = 0



// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=-= Modification of origin floors =-=-=-=-=-=-=-=-=-=-
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
