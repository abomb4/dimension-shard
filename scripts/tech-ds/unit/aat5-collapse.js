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

const lib = require('abomb4/lib')
const items = require('ds-common/items')
const bulletTypes = require('ds-common/bullet-types/index');
const { flyingConstructor } = require('abomb4/skill-framework');

const teleportColor = Color.valueOf("69dcee");
const shootEffect = new Effect(16, 24, cons(e => {
    Draw.color(teleportColor);
    for (var i = 0; i < 4; i++) {
        Drawf.tri(e.x, e.y, 4, 24 * e.fout(), i * 90 + e.id * 10);
    }

    Lines.stroke(Math.max(0, e.fout() - 0.5) * 2.5);
    Lines.circle(e.x, e.y, 24 * e.finpow());

    Draw.color();
    for (var i = 0; i < 4; i++) {
        Drawf.tri(e.x, e.y, 2, 12 * e.fout(), i * 90 + e.id * 10);
    }
}));
const unitType = (() => {
    const cooldown = 60 * 10;
    const activeTime = 60 * 3;
    const initRange = 50;
    const maxRange = 120;
    const rangeUpDmg = 1000;
    const maxRangeDmg = 4000;
    const damageDeflection = 0.25;

    function calculateRangeByDmg(dmg) {
        const base = maxRangeDmg - rangeUpDmg;
        const percent = Math.min(1, Math.max(0, dmg - rangeUpDmg) / base);
        return initRange + (maxRange - initRange) * percent;
    }

    const m = extendContent(UnitType, 'collapse', {
        load() {
            this.super$load();
            this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description", [
                cooldown / 60,
                activeTime / 60,
                damageDeflection * 100,
                initRange / Vars.tilesize,
                maxRange / Vars.tilesize,
                maxRangeDmg
            ]);
        },
        /**
         * @returns {import('abomb4/skill-framework').SkillDefinition[]}
         */
        getSkillDefinitions() {
            // num1: total damage
            // num2: color Status
            // num3: AI check
            // num4: display radius
            return [ {
                name: 'damage-deflection',
                range: 20,
                icon: lib.loadRegion('damage-deflection'),
                directivity: false,
                exclusive: false,
                activeTime: activeTime,
                cooldown: cooldown,
                aiCheckInterval: 30,
                aiCheck(skill, unit) {
                    const dps = 800;
                    const healthDanger = dps * this.aiCheckInterval / 60;
                    const enemyRange = maxRange;

                    if (skill.numValue3 > 0
                        && skill.numValue3 - unit.health > healthDanger
                        && Units.bestTarget(unit.team, unit.x, unit.y, enemyRange, boolf(e => !e.dead), boolf(b => true), Blocks.duo.unitSort)
                        ) {
                        unit.tryActiveSkill(this.name, {});
                        skill.numValue3 = 0;
                        return;
                    }
                    skill.numValue3 = unit.health;
                },
                active(skill, unit, data) {
                    Fx.heal.at(unit.x, unit.y);
                    skill.numValue1 = 0;
                    skill.numValue2 = 0;
                    skill.numValue4 = 0;

                    // Try active skill if serval Collapse under control
                    unit.controlling.each(cons(mem => {
                        if (mem.type == unit.type) {
                            mem.tryActiveSkill(this.name, data);
                        }
                    }));
                },
                preUpdate(skill, unit, lastFrame) {
                    skill.numValue2 = Mathf.lerpDelta(skill.numValue2, 0, 1 / 10);
                    skill.numValue4 = Mathf.lerpDelta(skill.numValue4, calculateRangeByDmg(skill.numValue1), 0.2);
                },
                postUpdate(skill, unit, lastFrame) {
                    if (lastFrame && unit && !unit.dead) {
                        if (skill.numValue1 > 1500) {
                            Fx.dynamicExplosion.at(unit.x, unit.y, calculateRangeByDmg(skill.numValue1) / 8 / 2);
                        } else {
                            Fx.bigShockwave.at(unit.x, unit.y);
                        }
                        Sounds.explosionbig.at(unit.x, unit.y)
                        Damage.damage(unit.team, unit.x, unit.y, calculateRangeByDmg(skill.numValue1) * 1.1, skill.numValue1 * damageDeflection);
                    }
                },
                draw(skill, unit, lastFrame) {
                    Draw.z(Layer.shields + 1);

                    const radius = skill.numValue4;
                    const danger = skill.numValue1 / maxRangeDmg;
                    const color = items.dimensionShardColorLight.cpy().lerp(Color.red, danger);
                    Draw.color(color, Color.white, skill.numValue2 * (1 - danger * 0.5));
                    Draw.alpha(0.3);
                    Fill.circle(unit.x, unit.y, radius);
                },
                updateDamage(skill, unit, amount) {
                    skill.numValue1 += amount;
                    skill.numValue2 = 1;
                    return amount * (1 - damageDeflection);
                },
            } ];
        },
    });

    m.constructor = flyingConstructor;

    m.armor = 10;
    m.health = 16500;
    m.speed = 0.6;
    m.rotateSpeed = 1;
    m.accel = 0.04;
    m.drag = 0.04;
    m.flying = true;
    m.engineOffset = 28;
    m.engineSize = 7.8;
    m.rotateShooting = false;
    m.hitSize = 60;
    m.lowAltitude = true;
    m.targetFlag = BlockFlag.turret;
    m.destructibleWreck = false;

    m.weapons.add(
        (() => {
            const w = new Weapon(lib.modName + "-collapse-weapon-0");
            w.mirror = false;
            w.shake = 4;
            w.shootY = 14;
            w.x = 0;
            w.y = -1;
            w.rotateSpeed = 4.2;
            w.reload = 110;
            w.recoil = 2;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.heatColor = teleportColor;
            w.cooldownTime = 100;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new JavaAdapter(PointBulletType, {
                    despawned(b) {
                        if (b) {
                            bulletTypes.blackHole.create(b, b.x, b.y, 0);
                            this.super$despawned(b);
                        }
                    }
                });
                bt.lifetime = 1;
                bt.shootEffect = shootEffect;
                bt.hitEffect = bulletTypes.fxBlackHoleExplode;
                bt.smokeEffect = Fx.none;
                bt.trailEffect = Fx.none;
                bt.despawnEffect = Fx.none;
                bt.hitSound = Sounds.explosion;
                bt.damage = 0;
                bt.splashDamageRadius = 80;
                bt.splashDamage = 15;
                bt.speed = 188;
                bt.hitShake = 2;
                bt.knockback = -0.55;
                bt.ammoMultiplier = 1;
                bt.reflectable = false;
                bt.absorbable = false;
                return bt;
            })();
            return w;
        })(),
        (() => {
            const w = new Weapon(lib.modName + "-collapse-weapon-1");
            w.shake = 4;
            w.shootY = 13;
            w.x = 23;
            w.y = 0;
            w.rotateSpeed = 4.3;
            w.reload = 60;
            w.recoil = 2;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.heatColor = teleportColor;
            w.cooldownTime = 90;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new PointBulletType();
                bt.lifetime = 1;
                bt.shootEffect = shootEffect;
                bt.hitEffect = Fx.none;
                bt.smokeEffect = Fx.smokeCloud;
                bt.trailEffect = Fx.none;
                bt.despawnEffect = Fx.massiveExplosion;
                bt.hitSound = Sounds.explosion;
                bt.damage = 0;
                bt.splashDamageRadius = 45;
                bt.splashDamage = 105;
                bt.status = StatusEffects.blasted;
                bt.speed = 200;
                bt.hitShake = 2;
                bt.reflectable = false;
                bt.absorbable = false;
                return bt;
            })();
            return w;
        })(),
        (() => {
            const w = new Weapon(lib.modName + "-collapse-weapon-2");
            w.shake = 4;
            w.shootY = 10;
            w.x = 12;
            w.y = 20;
            w.rotateSpeed = 4.1;
            w.reload = 40;
            w.recoil = 2;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.heatColor = teleportColor;
            w.cooldownTime = 70;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new PointBulletType();
                bt.lifetime = 1;
                bt.shootEffect = shootEffect;
                bt.hitEffect = Fx.none;
                bt.smokeEffect = Fx.none;
                bt.trailEffect = Fx.none;
                bt.despawnEffect = items.fxDimensionShardExplosion;
                bt.hitSound = Sounds.explosion;
                bt.damage = 0;
                bt.splashDamageRadius = 38;
                bt.splashDamage = 70;
                bt.speed = 160;
                bt.hitShake = 1.6;
                bt.reflectable = false;
                bt.absorbable = false;
                return bt;
            })();
            return w;
        })(),
        (() => {
            const w = new Weapon(lib.modName + "-collapse-weapon-2");
            w.shake = 4;
            w.shootY = 10;
            w.x = 13;
            w.y = -20;
            w.rotateSpeed = 4;
            w.reload = 36;
            w.recoil = 2;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.heatColor = teleportColor;
            w.cooldownTime = 50;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new PointBulletType();
                bt.lifetime = 1;
                bt.shootEffect = shootEffect;
                bt.hitEffect = Fx.none;
                bt.smokeEffect = Fx.none;
                bt.trailEffect = Fx.none;
                bt.despawnEffect = items.fxDimensionShardExplosion;
                bt.hitSound = Sounds.explosion;
                bt.damage = 0;
                bt.splashDamageRadius = 38;
                bt.splashDamage = 70;
                bt.speed = 180;
                bt.hitShake = 1.6;
                bt.reflectable = false;
                bt.absorbable = false;
                return bt;
            })();
            return w;
        })(),
    )
    return m;
})();

exports.collapse = unitType;
