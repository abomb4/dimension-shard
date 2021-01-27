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
const { flyingConstructor } = require('abomb4/skill-framework');

const unitType = (() => {

    const hyperspeedEffect = new Effect(40, cons(e => {
        Draw.color(Pal.accent);

        Fill.square(e.x, e.y, e.fslope() * 2, 45);
        Fill.square(e.x, e.y, e.fslope() * 2, 35);
    }));

    const damage = 4 / 60;
    const hyperUp = 2.5;
    const hyperSpeedUp = 1.3;
    const statusEffect = (() => {
        const v = new JavaAdapter(StatusEffect, {
            update(unit, time) {
                this.super$update(unit, time);

                if (unit.mining()) {
                    unit.mineTimer += unit.type.mineSpeed * (hyperUp - 1);
                }
                if (unit.isBuilding()) {
                    var finalPlaceDst = Vars.state.rules.infiniteResources ? Infinity : Vars.buildingRange;
                    var infinite = Vars.state.rules.infiniteResources || unit.team.rules().infiniteResources;
                    var core = unit.core();
                    var current = unit.buildPlan();
                    if (current == null) {
                        return;
                    }
                    var tile = current.tile();
                    if (!unit.within(tile, finalPlaceDst) || tile.build == null) {
                        return;
                    }
                    if ((core == null && !infinite) || !(tile.build.getClass() == ConstructBlock.ConstructBuild)) {
                        return;
                    }
                    var entity = tile.build;
                    if (current.breaking) {
                        entity.deconstruct(unit, core, 1.0 / entity.buildCost * Time.delta * unit.type.buildSpeed * (hyperUp - 1) * Vars.state.rules.buildSpeedMultiplier);
                    } else {
                        entity.construct(unit, core, 1.0 / entity.buildCost * Time.delta * unit.type.buildSpeed * (hyperUp - 1) * Vars.state.rules.buildSpeedMultiplier, current.config);
                    }
                }
            },
        }, "hyperspeed-1");

        v.color = Color.valueOf("cee0e9");
        v.speedMultiplier = hyperSpeedUp;
        v.reloadMultiplier = hyperUp;
        v.healthMultiplier = 0.9;
        v.damage = damage;
        v.effectChance = 0.4;
        v.effect = hyperspeedEffect;
        return v;
    })();
    const activeTime = 60 * 8;
    const cooldown = 60 * 14;
    const m = extend(UnitType, 'electron', {
        /**
         * @returns {import('abomb4/skill-framework').SkillDefinition[]}
         */
        getSkillDefinitions() {
            return [
                {
                    name: 'hyperspeed-1',
                    icon: lib.loadRegion('hyperspeed-1'),
                    directivity: false,
                    exclusive: true,
                    activeTime: activeTime,
                    cooldown: cooldown,
                    aiCheck(skill, unit) {
                        // If build a block that needs 5s build time, activate
                        if (unit.isBuilding() && unit.buildPlan() != null && unit.buildPlan().block.buildCost > 5 * 60) {
                            unit.tryActiveSkill(skill.name, {});
                        }
                    },
                    active(skill, unit, data) {
                        unit.apply(statusEffect, activeTime);

                        // Try active skill if serval Collapse under control
                        unit.controlling.each(cons(mem => {
                            if (mem.type == unit.type) {
                                mem.tryActiveSkill(this.name, data);
                            }
                        }));
                    },
                }
            ];
        },
        load() {
            this.super$load();
            this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description", [
                cooldown / 60,
                activeTime / 60,
                damage * 60,
                hyperSpeedUp * 100,
                hyperUp * 100,      // atk
                hyperUp * 100,      // mining
                hyperUp * 100,      // build
            ]);
        },
    });

    m.constructor = flyingConstructor;

    m.defaultController = prov(() => new BuilderAI());
    m.flying = true;
    m.lowAltitude = true;
    m.mineSpeed = 8;
    m.mineTier = 2;
    m.buildSpeed = 1;
    m.drag = 0.05;
    m.speed = 3.25;
    m.rotateSpeed = 20;
    m.accel = 0.11;
    m.itemCapacity = 70;
    m.health = 210;
    m.engineOffset = 6;
    m.hitSize = 11;
    m.commandLimit = 5;

    m.weapons.add(
        (() => {
            const w = new Weapon();
            w.top = false;
            w.reload = 20 - 1;
            w.x = 1;
            w.y = 2;
            w.shots = 3;
            w.spacing = 0;
            w.shotDelay = 3;
            w.inaccuracy = 0.1;
            w.ejectEffect = Fx.casing1;
            w.mirror = false;
            w.rotate = false;
            w.shootSound = Sounds.none;
            w.bullet = (() => {
                const b = new JavaAdapter(BasicBulletType, {
                    init(b) {
                        if (b) {
                            this.super$init(b);
                            Sounds.pew.at(b.x, b.y, Mathf.random(w.soundPitchMin, w.soundPitchMax));
                        } else {
                            this.super$init();
                        }
                    },
                }, 4, 11);
                b.width = 7;
                b.height = 11;
                b.lifetime = 62;
                b.shootEffect = Fx.shootSmall;
                b.smokeEffect = Fx.shootSmallSmoke;
                b.buildingDamageMultiplier = 0.01;
                return b;
            })();
            return w;
        })()
    )
    return m;
})();

exports.electron = unitType;
