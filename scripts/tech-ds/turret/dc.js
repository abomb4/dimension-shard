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

const { createDirectLightning } = require('ds-common/bullet-types/index');

const turret = new JavaAdapter(PowerTurret, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
}, 'dc');

turret.cooldown = 0.04;
turret.recoilAmount = 1;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 1700;
turret.size = 3;
turret.reloadTime = 50 - 1;
turret.range = 165;
turret.inaccuracy = 0;
turret.shots = 4;
turret.shootEffect = Fx.lightningShoot;
turret.heatColor = Color.red;
turret.rotateSpeed = 12;
turret.burstSpacing = 1;
turret.xRand = 6;
turret.shootSound = Sounds.spark;
turret.loopSound = Sounds.none;
turret.requirements = ItemStack.with(
    Items.lead, 320,
    Items.silicon, 80,
    Items.plastanium, 120,
    items.spaceCrystal, 60,
    items.hardThoriumAlloy, 30
);
turret.shootType = (() => {
    const s = new JavaAdapter(LightningBulletType, {
        init(b) {
            b && createDirectLightning(b, this.lightningColor, this.damage, b.x, b.y, b.rotation(), this.lightningLength + Mathf.random(this.lightningLengthRand));
        },
    });

    s.damage = 22;
    s.lightningLength = 24;
    s.lightningLengthRand = 12;
    s.lightningColor = Color.valueOf("69dcee");
    return s;
})()
turret.powerUse = 10;

lib.setBuildingSimple(turret, PowerTurret.PowerTurretBuild, block => ({
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

exports.dc = turret;
