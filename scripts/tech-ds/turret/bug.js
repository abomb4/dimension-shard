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


const turret = new JavaAdapter(ItemTurret, {
}, 'bug');

turret.recoilAmount = 2;
turret.liquidCapacity = 10;
turret.buildVisibility = BuildVisibility.shown;
turret.category = Category.turret;
turret.health = 1800;
turret.size = 3;
turret.reloadTime = 90;
turret.range = 220;
turret.rotateSpeed = 15;
turret.inaccuracy = 2;
turret.shots = 1;
turret.burstSpacing = 0;
turret.xRand = 0;
turret.shootSound = Sounds.boom;
turret.requirements = ItemStack.with(
    Items.copper, 200,
);
turret.ammo(
Items.sporePod, (() => {

    function getPercent(fullLen, currentLen, attenuation) {
        const outlen = currentLen - fullLen * attenuation;
        if (outlen <= 0) {
            return 1;
        } else {
            return 1 - outlen / (fullLen * (1 - attenuation))
        }
    }

    // 冲击波持续时长
    const shockwaveDuration = 30;
    // 冲击波力量
    const shockwavePower = 6;
    // 冲击波范围
    const shockwaveRadius = turret.range;
    // 冲击波力量衰减开始举例
    const shockwaveAttenuation = 0.3;
    // 冲击波力量衰减开始时长比例
    const shockwaveAttenuationTime = 0.4;

    const bt = new JavaAdapter(BasicBulletType, {
        draw(b) {
            var fin = b.time / this.lifetime;
            var fout = 1 - fin;
            Draw.color(Color.white, Color.lightGray, fin);
            Draw.alpha(0.7);
            Lines.stroke(fout * 3 + 0.5);
            Lines.circle(b.x, b.y, fin * (shockwaveRadius));
        },
        update(bullet) {
            const rect = new Rect();
            const team = bullet.team;
            const x = bullet.x, y = bullet.y;
            const con = cons((unit) => {
                const dst = unit.dst(x, y);
                if (unit.team == bullet.team || dst > shockwaveRadius) {
                    return;
                }
                const lengthFadeout = getPercent(shockwaveRadius, dst, shockwaveAttenuation);
                const timeFadeout = getPercent(shockwaveDuration, bullet.time, shockwaveAttenuationTime);
                const power = lengthFadeout * timeFadeout * shockwavePower * Time.delta;

                // drag
                unit.impulse(Tmp.v3.set(unit.getX(), unit.getY()).sub(x, y).scl(power));
                unit.vel.limit(3);
            });
            rect.setSize(shockwaveRadius * 2).setCenter(x, y);
            if (team != null) {
                Units.nearbyEnemies(team, rect, con);
            } else {
                Units.nearby(rect, con);
            }
        },
    });
    bt.lifetime = shockwaveDuration;
    bt.shootEffect = Fx.none;
    bt.hitEffect = Fx.none;
    bt.smokeEffect = Fx.none;
    bt.trailEffect = Fx.none;
    bt.despawnEffect = Fx.none;
    bt.damage = 0;
    bt.speed = 0;
    bt.collides = false;
    bt.collidesAir = false;
    bt.collidesGround = false;
    bt.absorbable = false;
    bt.hittable = false;
    bt.keepVelocity = false;
    bt.reflectable = false;

    return bt;
})()
);

turret.consumes.powerCond(1, boolf(b => b.isActive()));

exports.bug = turret;
