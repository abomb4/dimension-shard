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

const turret = new JavaAdapter(ItemTurret, {
}, 'thermite-splasher');

turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 1000;
turret.size = 2;
turret.reloadTime = 90 - 1;
turret.range = 120;
turret.rotateSpeed = 12;
turret.inaccuracy = 3;
turret.shots = 5;
turret.spread = 15;
turret.burstSpacing = 0;
turret.ammoUseEffect = Fx.none;
turret.shootCone = 30;
turret.coolantMultiplier = 1.5;
turret.shootSound = Sounds.shotgun;
turret.requirements = ItemStack.with(
    Items.iron, 90,
    items.aluminum, 90,
    Items.graphite, 40
);
turret.ammo(
    items.aluminum, (() => {
        const bt = new BasicBulletType(2.5, 9);
        bt.width = 8;
        bt.height = 8;
        bt.statusDuration = 60 * 3;
        bt.shootEffect = Fx.shootPyraFlame;
        bt.hitEffect = Fx.hitFlameSmall;
        bt.status = StatusEffects.melting;
        bt.lifetime = 60;
        bt.pierce = true;
        bt.pierceCap = 8;
        bt.ammoMultiplier = 1;
        return bt;
    })()
);

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

exports.thermiteSplasher = turret;
