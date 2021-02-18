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

const defineBlackHoleBullet = (() => {

    function percent(x, y, tx, ty, radius) {
        let dst = Mathf.dst(x, y, tx, ty);
        let falloff = 0.4;
        let scaled = Mathf.lerp(1 - dst / radius, 1, falloff);
        return scaled;
    }

    return (originOptions) => {
        const options = Object.assign({
            lifetime: 60,
            knockback: -0.55,
            splashDamage: 15,
            splashDamageRadius: 80,
            shootEffect: Fx.none,
            hitEffect: Fx.none,
            smokeEffect: Fx.none,
            trailEffect: Fx.none,
            despawnEffect: Fx.none,
            damage: 0,
            speed: 0,
            collides: false,
            collidesAir: false,
            collidesGround: false,
            absorbable: false,
            hittable: false,
            keepVelocity: false,
            reflectable: false,
        }, originOptions);

        const hole = new JavaAdapter(BasicBulletType, {
            init(b) {
                if (b === undefined) {
                    this.super$init();
                } else {
                    this.super$init(b);
                }
            },
            draw(b) {
                let fin = b.time / this.lifetime;
                let fout = 1 - fin;
                Draw.color(items.spaceCrystalColor, items.spaceCrystalColorLight, fout * 0.8 + 0.2);
                Draw.alpha(0.4 * fin + 0.6);
                Lines.stroke(fin * 3);
                Lines.circle(b.x, b.y, Mathf.sin(fout) * options.splashDamageRadius);

                Draw.color(items.spaceCrystalColor);
                Draw.alpha(Mathf.clamp(9 * fout, 0, 1));
                Fill.circle(b.x, b.y, (Interp.pow2Out.apply(fout) + 0.2) * options.splashDamageRadius / 10)
            },
            update(b) {
                if (b) {
                    let x = b.x;
                    let y = b.y;
                    let team = b.team;
                    let rect = new Rect();
                    rect.setSize(this.splashDamageRadius * 2).setCenter(x, y);
                    let con = cons(unit => {
                        if (unit.team == team || !unit.within(x, y, this.splashDamageRadius)) {
                            return;
                        }
                        let p = percent(x, y, unit.getX(), unit.getY(), this.splashDamageRadius);

                        // drag
                        unit.impulse(Tmp.v3.set(unit).sub(x, y).nor().scl(this.knockback * p * 80 * Time.delta));
                        unit.vel.limit(3);
                    });

                    Units.nearbyEnemies(team, rect, con);

                    // Damage per 5 ticks (damage 12 times expected, full damage once expected)
                    const delay = 5;
                    if (b.timer.get(1, delay)) {
                        const ss = 6;
                        const fullDamage = this.splashDamage / 60 * delay * Time.delta * b.damageMultiplier()
                        for (let i = 1; i <= ss; i++) {
                            let p = i / ss * 0.8 + 0.2;
                            Damage.damage(b.team, x, y, this.splashDamageRadius * p, fullDamage * p, true, true);
                        }
                    }
                }
            },
        });
        hole.lifetime = options.lifetime;
        hole.splashDamageRadius = options.splashDamageRadius;
        hole.splashDamage = options.splashDamage;
        hole.shootEffect = options.shootEffect;
        hole.hitEffect = options.hitEffect;
        hole.smokeEffect = options.smokeEffect;
        hole.trailEffect = options.trailEffect;
        hole.despawnEffect = options.despawnEffect;
        hole.damage = options.damage;
        hole.knockback = options.knockback;
        hole.speed = options.speed;
        hole.collides = options.collides;
        hole.collidesAir = options.collidesAir;
        hole.collidesGround = options.collidesGround;
        hole.absorbable = options.absorbable;
        hole.hittable = options.hittable;
        hole.keepVelocity = options.keepVelocity;
        hole.reflectable = options.reflectable;

        return hole;
    };
})();

exports.blackHole = defineBlackHoleBullet({
    lifetime: 60,
    knockback: -0.55,
    splashDamage: 15,
    splashDamageRadius: 80,
});
exports.blackHoleDamaged = defineBlackHoleBullet({
    lifetime: 120,
    knockback: -0.65,
    splashDamage: 80,
    splashDamageRadius: 160
});

exports.fxBlackHoleExplode = new Effect(8, 80, cons(e => {
    e.scaled(7, cons(i => {
        Lines.stroke(3 * i.fout());
        Lines.circle(e.x, e.y, 3 + i.fin() * 60);
    }));

    Draw.color(items.spaceCrystalColor);

    Angles.randLenVectors(e.id, 6, 2 + 19 * e.finpow(), new Floatc2({
        get: (x, y) => {
            Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5);
            Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
        }
    }));

    Draw.color(items.spaceCrystalColor, items.spaceCrystalColorLight, items.spaceCrystalColorLight, e.fin());
    Lines.stroke(1.5 * e.fout());

    Angles.randLenVectors(e.id + 1, 8, 1 + 46 * e.finpow(), new Floatc2({
        get: (x, y) => {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
        }
    }));
}));


exports.fxBlackHoleExplodeDamaged = new Effect(14, 160, cons(e => {
    e.scaled(7, cons(i => {
        Lines.stroke(3 * i.fout());
        Lines.circle(e.x, e.y, 3 + i.fin() * 60);
    }));

    Draw.color(items.spaceCrystalColor);

    Angles.randLenVectors(e.id, 6, 2 + 119 * e.finpow(), new Floatc2({
        get: (x, y) => {
            Fill.circle(e.x + x, e.y + y, e.fout() * 5 + 0.5);
            Fill.circle(e.x + x / 2, e.y + y / 2, e.fout() * 2);
        }
    }));

    Draw.color(items.spaceCrystalColor, items.spaceCrystalColorLight, items.spaceCrystalColorLight, e.fin());
    Lines.stroke(1.5 * e.fout());

    Angles.randLenVectors(e.id + 1, 8, 1 + 146 * e.finpow(), new Floatc2({
        get: (x, y) => {
            Lines.lineAngle(e.x + x, e.y + y, Mathf.angle(x, y), 1 + e.fout() * 6);
        }
    }));
}));
