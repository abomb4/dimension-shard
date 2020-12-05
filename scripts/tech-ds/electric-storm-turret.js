const lib = require('abomb4/lib');
const blockTypes = require('abomb4/block-types');

const items = require('ds-common/items');
const {
    dimensionAlloy
} = items;

const {
    newElectricStormBulletType
} = require('ds-common/bullet-types');

const turret = blockTypes.newNoRotatingTurret({
    name: 'electric-storm-turret',
    turretType: ItemTurret,
    coolantMultiplier: 2,
    buildingOverrides: {
        bullet(type, angle) {
            const { x, y, targetPos, team } = this;
            const { tr, velocityInaccuracy, minRange } = this.block;
            var lifeScl = type.scaleVelocity ? Mathf.clamp(Mathf.dst(x + tr.x, y + tr.y, targetPos.x, targetPos.y) / type.range(), minRange / type.range(), range / type.range()) : 1;
            // type.create(this, team, x + tr.x, y + tr.y, angle, -1, 1 + Mathf.range(velocityInaccuracy), lifeScl, {
            //     target: !this.isControlled() && this.target ? this.target : new Vec2(targetPos.getX(), targetPos.getY())
            // });

            if (this.isControlled() || this.logicShooting) {
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
    speedStart: 0.7,
    homingDelay: 30,
    lifetime: 150,
    homingRange: 400,
}));
