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
    dimensionAlloy
} = items;
const dsGlobal = require('ds-common/ds-global');

const {
    newElectricStormBulletType
} = require('ds-common/bullet-types/index');

const turret = blockTypes.newNoRotatingTurret({
    name: 'electric-storm-turret',
    turretType: ItemTurret,
    buildVisibility: BuildVisibility.shown,
    category: Category.turret,
    liquidCapacity: 120,
    health: 5000,
    size: 5,
    reloadTime: 150,
    range: 384,
    inaccuracy: 6,
    spread: 60,
    shots: 6,
    rotateSpeed: 1000,
    velocityInaccuracy: 0.8,
    shootCone: 360,
    shootSound: lib.loadSound('electric-shot'),
    requirements: ItemStack.with(
        Items.copper, 2500,
        Items.lead, 2000,
        Items.metaglass, 1500,
        Items.silicon, 1200,
        Items.plastanium, 1000,
        Items.phaseFabric, 800,
        Items.surgeAlloy, 1000,
        items.dimensionShard, 1600,
        items.hardThoriumAlloy, 800,
        items.dimensionAlloy, 300
    ),
    coolantMultiplier: 0.15,
    coolantUsage: 2,
    blockOverrides: {
        load() {
            this.super$load();
            this.baseRegion = lib.loadRegion("block-5");
        },
        isHidden() { return !dsGlobal.techDsAvailable(); },
    },
    buildingOverrides: {
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
        bullet(type, angle) {
            const { x, y, targetPos, team } = this;
            const { tr, velocityInaccuracy, minRange } = this.block;
            var lifeScl = type.scaleVelocity ? Mathf.clamp(Mathf.dst(x + tr.x, y + tr.y, targetPos.x, targetPos.y) / type.range(), minRange / type.range(), range / type.range()) : 1;
            // type.create(this, team, x + tr.x, y + tr.y, angle, -1, 1 + Mathf.range(velocityInaccuracy), lifeScl, {
            //     target: !this.isControlled() && this.target ? this.target : new Vec2(targetPos.getX(), targetPos.getY())
            // });

            if ((targetPos && targetPos.getX() != 0 && targetPos.getY() != 0) && (this.isControlled() || this.logicShooting)) {
                type.create(this, team, x + tr.x, y + tr.y, angle, -1, 1 + Mathf.range(velocityInaccuracy), lifeScl, {
                    target: new Vec2(targetPos.getX(), targetPos.getY())
                });
            } else {
                type.create(this, team, x + tr.x, y + tr.y, angle, 1 + Mathf.range(velocityInaccuracy), lifeScl);
            }
        },
    }
});

turret.ammo(dimensionAlloy, newElectricStormBulletType({
    speedStart: 0.8,
    homingDelay: 30,
    lifetime: 150,
    homingRange: 400,
    ammoMultiplier: 4,
}));

turret.consumes.powerCond(75, boolf(b => b.isActive()));

exports.electricStormTurret = turret;
