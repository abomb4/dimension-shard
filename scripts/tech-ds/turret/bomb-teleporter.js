const lib = require('abomb4/lib');

const items = require('ds-common/items');
const dsGlobal = require('ds-common/ds-global');

const turret = new JavaAdapter(ItemTurret, {
    isHidden() { return !dsGlobal.techDsAvailable(); },
}, 'bomb-teleporter');

turret.recoilAmount = 2;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 3000;
turret.size = 3;
turret.reloadTime = 90;
turret.range = 220;
turret.rotateSpeed = 15;
turret.inaccuracy = 2;
turret.shots = 1;
turret.burstSpacing = 0;
turret.xRand = 0;
turret.shootSound = lib.loadSound('bomb-teleport');
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
    bt.smokeEffect = Fx.smokeCloud;
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
    return bt;
})(),
Items.sporePod, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.smokeCloud;
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
    return bt;
})(),
Items.blastCompound, (() => {
    const bt = new PointBulletType();
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.smokeCloud;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.massiveExplosion;
    bt.hitSound = Sounds.explosion;
    bt.damage = 0;
    bt.splashDamageRadius = 45;
    bt.splashDamage = 120;
    bt.status = StatusEffects.blasted;
    bt.speed = turret.range;
    bt.hitShake = 2;
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
    bt.splashDamage = 80;
    bt.speed = turret.range;
    bt.hitShake = 1.6;
    return bt;
})(),
);

turret.consumes.powerCond(1, boolf(b => b.isActive()));

lib.setBuildingSimple(turret, ItemTurret.ItemTurretBuild, {
});

exports.bombTeleporter = turret;
