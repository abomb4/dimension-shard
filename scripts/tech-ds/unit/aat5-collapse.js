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

const unitType = (() => {
    const m = extendContent(UnitType, 'collapse', {
        /**
         * @returns {import('abomb4/skill-framework').SkillDefinition[]}
         */
        getSkillDefinitions() {
            return [
                {
                    name: 'damage-deflection',
                    range: 20,
                    icon: lib.loadRegion('damage-deflection'),
                    directivity: false,
                    exclusive: false,
                    activeTime: 60 * 3,
                    cooldown: 60 * 10,
                    aiCheckInterval: 30,
                    aiCheck(skill, unit) {
                        const dps = 800;
                        const healthDanger = dps * this.aiCheckInterval / 60;
                        const enemyRange = 50 * 1.5;

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

                        // Try active skill if serval Collapse under control
                        unit.controlling.each(cons(mem => {
                            if (mem.type == unit.type) {
                                mem.tryActiveSkill(this.name, data);
                            }
                        }));
                    },
                    preUpdate(skill, unit, lastFrame) {
                        skill.numValue2 = Mathf.lerpDelta(skill.numValue2, 0, 1 / 10);
                    },
                    postUpdate(skill, unit, lastFrame) {
                        if (lastFrame && unit && !unit.dead) {
                            Fx.massiveExplosion.at(unit.x, unit.y);
                            Sounds.explosionbig.at(unit.x, unit.y)
                            Damage.damage(unit.team, unit.x, unit.y, 100, skill.numValue1);
                        }
                    },
                    draw(skill, unit, lastFrame) {
                        Draw.z(Layer.shields);

                        const radius = 50 * Math.min((skill.def.activeTime - skill.activeTimeLeft) / 8, 1);
                        const danger = skill.numValue1 / 4000;
                        const color = items.dimensionShardColorLight.cpy().lerp(Color.red, danger);
                        Draw.color(color, Color.white, skill.numValue2 * (1 - danger * 0.5));
                        if (Core.settings.getBool("animatedshields")) {
                            Fill.circle(unit.x, unit.y, radius);
                        } else {
                            Lines.stroke(1.5);
                            Draw.alpha(0.09 + Mathf.clamp(0.08 * skill.numValue2));
                            Fill.circle(unit.x, unit.y, radius);
                            Draw.alpha(1);
                            Lines.circle(unit.x, unit.y, radius);
                            Draw.reset();
                        }
                    },
                    updateDamage(skill, unit, amount) {
                        skill.numValue1 += amount;
                        skill.numValue2 = 1;
                        return amount;
                    },
                },
            ];
        },
    });

    m.constructor = flyingConstructor;

    m.armor = 10;
    m.health = 18000;
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
            w.shootY = 8;
            w.x = 0;
            w.y = -4;
            w.rotateSpeed = 4.2;
            w.reload = 110;
            w.recoil = 4;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
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
                bt.shootEffect = Fx.none;
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
            w.shootY = 8;
            w.x = 20;
            w.y = 2;
            w.rotateSpeed = 4.3;
            w.reload = 50;
            w.recoil = 4;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new PointBulletType();
                bt.lifetime = 1;
                bt.shootEffect = Fx.none;
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
            w.shootY = 5;
            w.x = 14;
            w.y = 20;
            w.rotateSpeed = 4.1;
            w.reload = 34;
            w.recoil = 4;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new PointBulletType();
                bt.lifetime = 1;
                bt.shootEffect = Fx.none;
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
            w.shootY = 5;
            w.x = 12;
            w.y = -20;
            w.rotateSpeed = 4;
            w.reload = 30;
            w.recoil = 4;
            w.shootCone = 5;
            w.shootSound = lib.loadSound('bomb-teleport');
            w.shadow = 20;
            w.rotate = true;
            w.bullet = (() => {
                const bt = new PointBulletType();
                bt.lifetime = 1;
                bt.shootEffect = Fx.none;
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
