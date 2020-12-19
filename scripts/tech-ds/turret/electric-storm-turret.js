const lib = require('abomb4/lib');
const blockTypes = require('abomb4/block-types');

const items = require('ds-common/items');
const {
    dimensionAlloy
} = items;
const dsGlobal = require('ds-common/ds-global');

const {
    newElectricStormBulletType
} = require('ds-common/bullet-types');

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
