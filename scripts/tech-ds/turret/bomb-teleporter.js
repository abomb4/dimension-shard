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
const dsGlobal = require('ds-common/ds-global');
const bulletTypes = require('ds-common/bullet-types/index');

const teleportColor = Color.valueOf("69dcee");
const shootEffect = new Effect(16, 24, cons(e => {
    Draw.color(teleportColor);
    for (var i = 0; i < 4; i++) {
        Drawf.tri(e.x, e.y, 4, 24 * e.fout(), i * 90 + e.id * 10);
    }

    Lines.stroke(Math.max(0, e.fout() - 0.5) * 2.5);
    Lines.circle(e.x, e.y, 24 * e.finpow());

    Draw.color();
    for (var i = 0; i < 4; i++) {
        Drawf.tri(e.x, e.y, 2, 12 * e.fout(), i * 90 + e.id * 10);
    }
}));
const turret = new JavaAdapter(ItemTurret, {
    isPlaceable() { return dsGlobal.techDsAvailable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
    },
    canPlaceOn(tile, team) {
        if (!dsGlobal.techDsAvailable()) {
            return false;
        }
        return this.super$canPlaceOn(tile, team);
    }
}, 'bomb-teleporter');

turret.cooldown = 0.04;
turret.recoilAmount = 1.5;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 1800;
turret.size = 3;
turret.reloadTime = 45 - 1;
turret.range = 220;
turret.rotateSpeed = 15;
turret.inaccuracy = 2;
turret.shots = 1;
turret.burstSpacing = 0;
turret.xRand = 0;
turret.shootEffect = shootEffect;
turret.shootSound = lib.loadSound('bomb-teleport');
turret.heatColor = teleportColor;
turret.requirements = ItemStack.with(
    Items.copper, 200,
    Items.silicon, 130,
    Items.thorium, 110,
    items.spaceCrystal, 30
);
turret.ammo(Items.coal, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.explosion;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 30;
    bt.splashDamage = 30;
    // bt.fragBullets = 1;
    // bt.fragBullet = Bullets.fireball;
    bt.makeFire = true;
    bt.status = StatusEffects.burning;
    bt.statusDuration = 120;
    bt.speed = turret.range;
    bt.hitShake = 1;
    bt.reflectable = false;
    bt.absorbable = false;
    return bt;
})(),
Items.sporePod, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.explosion;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 24;
    bt.splashDamage = 10;
    // bt.fragBullets = 1;
    // bt.fragBullet = Bullets.fireball;
    bt.makeFire = true;
    bt.status = StatusEffects.burning;
    bt.statusDuration = 150;
    bt.speed = turret.range;
    bt.hitShake = 1.1;
    bt.reflectable = false;
    bt.absorbable = false;
    return bt;
})(),
Items.pyratite, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.smokeCloud;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.blastExplosion;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 32;
    bt.splashDamage = 50;
    // bt.fragBullets = 2;
    // bt.fragBullet = Bullets.fireball;
    bt.makeFire = true;
    bt.status = StatusEffects.burning;
    bt.statusDuration = 240;
    bt.speed = turret.range;
    bt.hitShake = 1.5;
    bt.reflectable = false;
    bt.absorbable = false;
    return bt;
})(),
Items.blastCompound, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.massiveExplosion;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 45;
    bt.splashDamage = 105;
    bt.status = StatusEffects.blasted;
    bt.speed = turret.range;
    bt.hitShake = 2;
    bt.reflectable = false;
    bt.absorbable = false;
    return bt;
})(),
items.dimensionShard, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = items.fxDimensionShardExplosion;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 38;
    bt.splashDamage = 70;
    bt.speed = turret.range;
    bt.hitShake = 1.6;
    bt.reflectable = false;
    bt.absorbable = false;
    return bt;
})(),
items.spaceCrystal, (() => {
    const bt = new JavaAdapter(PointBulletType, {
        despawned(b) {
            if (b) {
                bulletTypes.blackHole.create(b, b.x, b.y, 0);
                this.super$despawned(b);
            }
        }
    });
    bt.shootEffect = Fx.none;
    bt.hitEffect = bulletTypes.fxBlackHoleExplode;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.none;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 80;
    bt.splashDamage = 15;
    bt.speed = turret.range;
    bt.hitShake = 2;
    bt.knockback = -0.55;
    bt.reloadMultiplier = 0.6;
    bt.ammoMultiplier = 1;
    bt.reflectable = false;
    bt.absorbable = false;
    return bt;
})(),
);

turret.consumes.powerCond(1, boolf(b => b.isActive()));

lib.setBuildingSimple(turret, ItemTurret.ItemTurretBuild, block => ({
    // I think the default udpatShooting and updateCooling is wrong, so modify it.
    updateShooting() {
        if (this.reload >= this.block.reloadTime) {
            var type = this.peekAmmo();
            this.shoot(type);
            this.reload -= this.block.reloadTime;
        }
    },
    updateTile() {
        this.super$updateTile();
        // Do reload if has ammo.
        if (this.hasAmmo() && this.reload < this.block.reloadTime) {
            this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
        }
    },
}));

exports.bombTeleporter = turret;
