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
const blockTypes = require('abomb4/block-types');

const items = require('ds-common/items');
const {
    ionLiquid
} = items;
const dsGlobal = require('ds-common/ds-global');

const {
    newIonBoltBulletType
} = require('ds-common/bullet-types/index');

const turret = new JavaAdapter(LiquidTurret, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
}, 'ion-bolt-turret');

turret.recoilAmount = 2;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 3000;
turret.size = 4;
turret.reloadTime = 60;
turret.range = 220;
turret.inaccuracy = 2;
turret.shots = 3;
turret.rotateSpeed = 8;
turret.burstSpacing = 6;
turret.xRand = 0;
turret.shootSound = lib.loadSound('ion-shot');
turret.loopSound = Sounds.none;
turret.requirements = ItemStack.with(
    Items.copper, 1200,
    Items.lead, 1600,
    Items.graphite, 800,
    Items.plastanium, 1200,
    Items.surgeAlloy, 600,
    items.timeCrystal, 160,
    items.hardThoriumAlloy, 700
);
turret.ammo(ionLiquid, newIonBoltBulletType({
    ammoMultiplier: 1,
    damage: 50,
}));
// turret.consumes.powerCond(50, boolf(b => b.isActive()));

lib.setBuildingSimple(turret, LiquidTurret.LiquidTurretBuild, {
    // I think the default udpatShooting and updateCooling is wrong, so modify it.
    updateShooting() {
        if (this.reload >= this.block.reloadTime) {
            var type = this.peekAmmo();
            this.shoot(type);
            this.reload = 0;
        }
    },
    updateTile() {
        this.super$updateTile();
        // Do reload if has ammo.
        if (this.hasAmmo() && this.reload < this.block.reloadTime) {
            this.reload += this.delta() * this.peekAmmo().reloadMultiplier * this.baseReloadSpeed();
        }
    },
    acceptLiquid(source, liquid) {
        const ammoTypes = this.block.ammoTypes;
        const liquids = this.liquids;
        return ammoTypes.get(liquid) != null
            && (liquids.current() == liquid || (ammoTypes.containsKey(liquid)
                && (!(ammoTypes.get(liquids.current())) || liquids.get(liquids.current()) <= 1 / ammoTypes.get(liquids.current()).ammoMultiplier + 0.001)
            ));
    }
});

exports.ionBoltTurret = turret;
