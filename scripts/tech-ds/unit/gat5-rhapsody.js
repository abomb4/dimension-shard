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
const { newIonBoltBulletType } = require('ds-common/bullet-types/index');
const { mechConstructor } = require('abomb4/skill-framework');
const { largeIonLaser } = require('ds-common/bullet-types/index');

const unitType = (() => {
    const skillY = 10;
    const chargeSound = Sounds.lasercharge;
    const shootSound = Sounds.laserblast;
    const laserBullet = largeIonLaser;
    const laserShake = 14;
    const fxIonLaserCharge = new Effect(60 * 3, 100, cons(e => {
        const data = e.data;
        var x = data.getX();
        var y = data.getY();
        Draw.color(items.ionLiquid.color);
        Lines.stroke(e.fin() * 2);
        Lines.circle(x, y, 4 + e.fout() * 100);

        Fill.circle(x, y, e.fin() * 20);

        Angles.randLenVectors(e.id, 20, 40 * e.fout(), lib.floatc2((x, y) => {
            Fill.circle(x + x, y + y, e.fin() * 5);
        }));

        Draw.color();

        Fill.circle(x, y, e.fin() * 10);
    }));

    var tmp = {};
    const m = extendContent(UnitType, 'rhapsody', {
        /**
         * @returns {import('abomb4/skill-framework').SkillDefinition[]}
         */
        getSkillDefinitions() {
            return [
                {
                    name: 'ion-laser-large',
                    range: 20,
                    icon: lib.loadRegion('ion-laser-large'),
                    directivity: true,
                    exclusive: true,
                    activeTime: 60 * 3,
                    cooldown: 60 * 12,
                    aiCheck(skill, unit) {
                        const target = Units.bestTarget(unit.team, unit.x, unit.y, laserBullet.length - 10,
                            boolf(e => !e.dead), boolf(b => true), Blocks.duo.unitSort);
                        if (target) {
                            const bullet = m.weapons.get(0).bullet;
                            const range = bullet.lifetime * bullet.speed;
                            if (unit.dst(target) > range) {
                                unit.tryActiveSkill(this.name, {
                                    x: target.x,
                                    y: target.y
                                });
                            }
                        }
                    },
                    active(skill, unit, data) {
                        const the = (() => {
                            var weapon = unit.mounts[0].weapon;
                            return {
                                getX() {
                                    var mountX = unit.x + Angles.trnsx(unit.rotation - 90, weapon.x, weapon.y);
                                    var shootX = mountX + Angles.trnsx(unit.rotation - 90, weapon.shootX, weapon.shootY + skillY);
                                    return shootX;
                                },
                                getY() {
                                    var mountY = unit.y + Angles.trnsy(unit.rotation - 90, weapon.x, weapon.y);
                                    var shootY = mountY + Angles.trnsy(unit.rotation - 90, weapon.shootX, weapon.shootY + skillY);
                                    return shootY;
                                },
                            }
                        })();

                        fxIonLaserCharge.at(the.getX(), the.getY(), 0, items.ionLiquid.color, {
                            getX: () => the.getX(),
                            getY: () => the.getY(),
                        });
                        chargeSound.at(the.getX(), the.getY(), 80 / (60 * 3));

                        skill.numValue1 = data.x;
                        skill.numValue2 = data.y;

                        // Try active skill if serval Collapse under control
                        unit.controlling.each(cons(mem => {
                            if (mem.type == unit.type) {
                                mem.tryActiveSkill(this.name, data);
                            }
                        }));
                    },
                    preUpdate(skill, unit, lastFrame) {
                        unit.vel.setZero();
                        skill.numValue3 = unit.rotation;
                        // var ang = Tmp.v1.set(unit.x, unit.y).angleTo(skill.numValue1, skill.numValue2);
                        // unit.lookAt(ang);
                        for (var mount of unit.mounts) {
                            mount.reload = 100;
                        }
                    },
                    postUpdate(skill, unit, lastFrame) {
                        var ang = Tmp.v1.set(unit.x, unit.y).angleTo(skill.numValue1, skill.numValue2);
                        unit.rotation = skill.numValue3;
                        unit.lookAt(ang);
                        if (lastFrame) {
                            var weapon = unit.mounts[0].weapon;
                            var mountX = unit.x + Angles.trnsx(unit.rotation - 90, weapon.x, weapon.y);
                            var mountY = unit.y + Angles.trnsy(unit.rotation - 90, weapon.x, weapon.y);
                            var shootX = mountX + Angles.trnsx(unit.rotation - 90, weapon.shootX, weapon.shootY + skillY);
                            var shootY = mountY + Angles.trnsy(unit.rotation - 90, weapon.shootX, weapon.shootY + skillY);
                            var ang = Tmp.v1.set(shootX, shootY).angleTo(skill.numValue1, skill.numValue2);
                            laserBullet.create(unit, unit.team, shootX, shootY, ang);
                            Effect.shake(laserShake, laserShake, shootX, shootY);
                            for (var mount of unit.mounts) {
                                mount.reload = weapon.reload;
                            }
                            shootSound.at(shootX, shootY, 0.7);
                        }
                    },
                    draw(skill, unit, lastFrame) {
                        Draw.z(Layer.shields);

                        const radius = 50 * Math.min((skill.def.activeTime - skill.activeTimeLeft) / 8, 1);
                        const danger = skill.numValue1 / 4000;
                        const color = items.dimensionShardColorLight.cpy().lerp(Color.red, danger);
                        Draw.color(color, Color.white, skill.numValue2 * (1 - danger * 0.5));
                    },
                    updateDamage(skill, unit, amount) {
                        return amount * 1.2;
                    },
                },
            ];
        },
    });

    m.constructor = mechConstructor;

    m.armor = 15;
    m.health = 17000;
    m.speed = 0.35;
    m.rotateSpeed = 1.8;
    m.flying = false;
    m.rotateShooting = true;
    m.hitSize = 30;
    m.destructibleWreck = false;
    m.canDrown = false;
    m.mechFrontSway = 1.5;
    m.mechSideSway = 0.6;
    m.mechStepParticles = true;
    m.mechStepShake = 0.75;
    m.singleTarget = true;
    m.immunities.add(items.ionBurningEffect);
    m.immunities.add(StatusEffects.burning);

    m.weapons.add(
        (() => {
            const w = new Weapon(lib.modName + "-rhapsody-weapon");
            w.mirror = false;
            w.shake = 2;
            w.shots = 3;
            w.shotDelay = 6;
            w.inaccuracy = 0;
            w.shootX = 0;
            w.shootY = 29;
            w.x = 16;
            w.y = 3;
            w.rotateSpeed = 4;
            w.reload = 60;
            w.recoil = 2;
            w.shootSound = Sounds.none;
            w.shadow = 0;
            w.rotate = false;
            w.bullet = newIonBoltBulletType({
                overrides: {
                    init(b) {
                        if (b) {
                            this.super$init(b);
                            lib.loadSound('ion-shot').at(b.x, b.y, Mathf.random(w.soundPitchMin, w.soundPitchMax));
                        }
                        else {
                            this.super$init();
                        }
                    },
                }
            });
            return w;
        })()
    )

    return m;
})();

exports.rhapsody = unitType;
