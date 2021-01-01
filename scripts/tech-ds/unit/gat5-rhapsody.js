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
const { newDeflectForceFieldAbility } = require('abomb4/abilities');
const { newIonBoltBulletType } = require('ds-common/bullet-types/index');
const { mechConstructor } = require('abomb4/skill-framework');

const unitType = (() => {
    const m = extendContent(UnitType, 'rhapsody', {
        getSkillDefinitions() {
            return [
                {
                    name: 'ion-laser-large',
                    range: 20,
                    icon: lib.loadRegion('ion-laser-large'),
                    directivity: true,
                    exclusive: true,
                    activeTime: 60 * 4,
                    cooldown: 60 * 4,
                    active(skill, unit, data) {
                        Fx.heal.at(unit.x, unit.y);
                        skill.numValue1 = data.x;
                        skill.numValue2 = data.y;
                    },
                    preUpdate(skill, unit, lastFrame) {
                        unit.vel.setZero();
                        var ang = Tmp.v1.set(unit.x, unit.y).angleTo(skill.numValue1, skill.numValue2);
                        unit.lookAt(ang);
                        for (var mount of unit.mounts) {
                            mount.reload = 100;
                        }
                    },
                    postUpdate(skill, unit, lastFrame) {
                        // if (lastFrame && unit && !unit.dead) {
                        //     Fx.massiveExplosion.at(unit.x, unit.y);
                        //     Sounds.explosionbig.at(unit.x, unit.y)
                        //     Damage.damage(unit.team, unit.x, unit.y, 100, skill.numValue1);
                        // }
                        unit.vel.setLength(0.01);
                        if (lastFrame) {
                            var ang = Tmp.v1.set(unit.x, unit.y).angleTo(skill.numValue1, skill.numValue2);
                            UnitTypes.corvus.weapons.get(0).bullet.create(unit, unit.team, unit.x, unit.y, ang);
                            UnitTypes.corvus.weapons.get(0).bullet.create(unit, unit.team, unit.x, unit.y, ang);
                            UnitTypes.corvus.weapons.get(0).bullet.create(unit, unit.team, unit.x, unit.y, ang);
                            UnitTypes.corvus.weapons.get(0).bullet.create(unit, unit.team, unit.x, unit.y, ang);
                            UnitTypes.corvus.weapons.get(0).bullet.create(unit, unit.team, unit.x, unit.y, ang);
                            for (var mount of unit.mounts) {
                                mount.reload = 1;
                            }
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
                            Draw.alpha(0.09 + Mathf.clamp(0.08 * hit));
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

    m.constructor = mechConstructor;

    m.armor = 9;
    m.health = 8000;
    m.speed = 0.35;
    m.rotateSpeed = 2;
    m.flying = false;
    m.rotateShooting = true;
    m.hitSize = 20;
    m.destructibleWreck = false;
    m.canDrown = false;
    m.mechFrontSway = 1;
    m.mechStepParticles = true;
    m.mechStepShake = 0.15;
    m.singleTarget = true;

    m.weapons.add(
        (() => {
            const w = new Weapon(lib.modName + "-rhapsody-weapon");
            w.shake = 3;
            w.shots = 8;
            w.shotDelay = 0.5;
            w.inaccuracy = 0;
            w.shootY = 9;
            w.x = 17;
            w.y = 0;
            w.rotateSpeed = 4;
            w.reload = 15.5;
            w.recoil = 2;
            w.shootSound = Blocks.salvo.shootSound;
            w.shadow = 0;
            w.rotate = false;
            w.bullet = (() => {
                const v2 = new BasicBulletType(7, 24);
                v2.lifetime = 26;
                v2.ammoMultiplier = 4;
                v2.width = Bullets.standardThorium.width;
                v2.height = Bullets.standardThorium.height * 2;
                v2.frontColor = Bullets.standardThorium.frontColor;
                v2.backColor = Bullets.standardThorium.backColor;
                v2.pierceBuilding = false;
                // v.status = StatusEffects.blasted;
                return v2;
            })();
            return w;
        })()
    )

    return m;
})();

exports.remix = unitType;
