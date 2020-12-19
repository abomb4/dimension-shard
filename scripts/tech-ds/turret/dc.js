const lib = require('abomb4/lib');

const items = require('ds-common/items');
const dsGlobal = require('ds-common/ds-global');

const { createDirectLightning } = require('ds-common/bullet-types');

const turret = new JavaAdapter(PowerTurret, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
}, 'dc');

turret.recoilAmount = 1;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 1700;
turret.size = 3;
turret.reloadTime = 50;
turret.range = 180;
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
    Items.lead, 280,
    Items.silicon, 80,
    Items.plastanium, 120,
    items.spaceCrystal, 40,
    items.hardThoriumAlloy, 25
);
turret.shootType = (() => {
    const s = new JavaAdapter(LightningBulletType, {
        init(b) {
            b && createDirectLightning(b, this.lightningColor, this.damage, b.x, b.y, b.rotation(), this.lightningLength + Mathf.random(this.lightningLengthRand));
        },
    });

    s.damage = 20;
    s.lightningLength = 36;
    s.lightningLengthRand = 8;
    s.lightningColor = Color.valueOf("69dcee");
    return s;
})()
turret.powerUse = 9;

lib.setBuildingSimple(turret, PowerTurret.PowerTurretBuild, {
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
});

exports.ionBoltTurret = turret;
