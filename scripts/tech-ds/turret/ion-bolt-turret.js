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

let liquidRegion;
let topRegion;
let chargeRegions = []

const turret = new JavaAdapter(LiquidTurret, {
    load() {
        this.super$load()
        liquidRegion = lib.loadRegion('ion-bolt-turret-liquid')
        topRegion = lib.loadRegion('ion-bolt-turret-top')
        chargeRegions.push(lib.loadRegion('ion-bolt-turret-charge-1'))
        chargeRegions.push(lib.loadRegion('ion-bolt-turret-charge-2'))
        chargeRegions.push(lib.loadRegion('ion-bolt-turret-charge-3'))
    },
    myGetTr() {
        return this.tr;
    },
    myGetTr2() {
        return this.tr2;
    },
    isPlaceable() { return dsGlobal.techDsAvailable() && this.super$isPlaceable(); },
    drawPlace(x, y, rotation, valid) {
        if (!dsGlobal.techDsAvailable()) {
            this.drawPlaceText(lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
        }
        this.super$drawPlace(x, y, rotation, valid);
    },
}, 'ion-bolt-turret');

turret.recoilAmount = 2;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 3000;
turret.size = 4;
turret.reloadTime = 60 - 1;
turret.range = 220;
turret.inaccuracy = 2;
turret.shots = 3;
turret.rotateSpeed = 8;
turret.burstSpacing = 6;
turret.xRand = 0;
turret.shootSound = lib.loadSound('ion-shot');
turret.loopSound = Sounds.none;
turret.requirements = ItemStack.with(
    Items.lead, 1200,
    Items.metaglass, 500,
    Items.graphite, 600,
    Items.plastanium, 600,
    Items.surgeAlloy, 400,
    items.timeCrystal, 160,
    items.hardThoriumAlloy, 500
);
turret.ammo(ionLiquid, newIonBoltBulletType({
    ammoMultiplier: 1,
    damage: 50,
}));
// turret.consumes.powerCond(50, boolf(b => b.isActive()));

const lightningBulletType = new JavaAdapter(LightningBulletType, {
    init(b) {
        if (b === undefined) {
            this.lightningLength = 14;
            this.lightningLengthRand = 6;
            this.lightningColor = ionLiquid.color;
            this.damage = 20;
            this.super$init();
        } else {
            this.super$init(b);
        }
    },
});
const lightningBulletTypeShootEffect = Fx.lightningShoot;
const lightningBulletShootSound = Sounds.spark;

lib.setBuildingSimple(turret, LiquidTurret.LiquidTurretBuild, block => ({
    // I think the default udpatShooting and updateCooling is wrong, so modify it.
    updateShooting() {
        if (this.reload >= this.block.reloadTime) {
            let type = this.peekAmmo();
            this.shoot(type);
            this.reload -= this.block.reloadTime;
        }
    },
    bullet(type, angle) {
        this.super$bullet(type, angle);
        const tr = turret.myGetTr();
        Tmp.v1.trns(tr.angle() + 60, 15)
        Tmp.v2.trns(tr.angle() - 60, 15)
        const x1 = this.x + Tmp.v1.x
        const y1 = this.y + Tmp.v1.y;
        const x2 = this.x + Tmp.v2.x
        const y2 = this.y + Tmp.v2.y;
        lightningBulletType.create(this, this.team, x1, y1, angle)
        lightningBulletType.create(this, this.team, x2, y2, angle)
        lightningBulletTypeShootEffect.at(x1, y1, tr.angle())
        lightningBulletTypeShootEffect.at(x2, y2, tr.angle())
        lightningBulletShootSound.at(this.x, this.y);
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
    },
    draw() {
        this.super$draw();
        const tr2 = turret.myGetTr2();

        Drawf.liquid(liquidRegion, this.x + tr2.x, this.y + tr2.y, this.liquids.total() / turret.liquidCapacity, this.liquids.current().color, this.rotation - 90);
        Draw.rect(topRegion, this.x + tr2.x, this.y + tr2.y, this.rotation - 90);

        const loadPercentLen = Math.max(0, (this.reload / this.block.reloadTime * 1.4 - 0.4)) * chargeRegions.length;
        for (let i = 0; i < chargeRegions.length; i++) {
            Draw.alpha(Interp.pow2In.apply(Mathf.clamp(loadPercentLen - i, 0, 1)));
            Draw.rect(chargeRegions[i], this.x + tr2.x, this.y + tr2.y, this.rotation - 90);
        }
    },
}));

exports.ionBoltTurret = turret;
