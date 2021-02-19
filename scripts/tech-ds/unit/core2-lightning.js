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

const lightColor = Color.valueOf("69dcee");
const fxHitBulletSmall = new Effect(14, cons(e => {
    Draw.color(Color.white, lightColor, e.fin());

    e.scaled(7, cons(s => {
        Lines.stroke(0.5 + s.fout());
        Lines.circle(e.x, e.y, s.fin() * 5);
    }));

    Lines.stroke(0.5 + e.fout());

    Angles.randLenVectors(e.id, 5, e.fin() * 15, lib.floatc2((x, y) => {
        let ang = Mathf.angle(x, y);
        Lines.lineAngle(e.x + x, e.y + y, ang, e.fout() * 3 + 1);
    }));
}));
const unitType = (() => {

    const hyperspeedEffect = new Effect(40, cons(e => {
        Draw.color(Pal.accent);

        Fill.square(e.x, e.y, e.fslope() * 2, 45);
        Fill.square(e.x, e.y, e.fslope() * 2.1, 35);
        Fill.square(e.x, e.y, e.fslope() * 1.9, 25);
    }));

    const damage = 5 / 60;
    const hyperUp = 4.5;
    const hyperSpeedUp = 1.6;
    const statusEffect = (() => {
        const v = new JavaAdapter(StatusEffect, {
            update(unit, time) {
                this.super$update(unit, time);

                if (unit.mining()) {
                    unit.mineTimer += unit.type.mineSpeed * (hyperUp - 1);
                }
                if (unit.isBuilding()) {
                    let finalPlaceDst = Vars.state.rules.infiniteResources ? Infinity : Vars.buildingRange;
                    let infinite = Vars.state.rules.infiniteResources || unit.team.rules().infiniteResources;
                    let core = unit.core();
                    let current = unit.buildPlan();
                    if (current == null) {
                        return;
                    }
                    let tile = current.tile();
                    if (!unit.within(tile, finalPlaceDst) || tile.build == null) {
                        return;
                    }
                    if ((core == null && !infinite) || !(tile.build.getClass() == ConstructBlock.ConstructBuild)) {
                        return;
                    }
                    let entity = tile.build;
                    if (current.breaking) {
                        entity.deconstruct(unit, core, 1.0 / entity.buildCost * Time.delta * unit.type.buildSpeed * (hyperUp - 1) * Vars.state.rules.buildSpeedMultiplier);
                    } else {
                        entity.construct(unit, core, 1.0 / entity.buildCost * Time.delta * unit.type.buildSpeed * (hyperUp - 1) * Vars.state.rules.buildSpeedMultiplier, current.config);
                    }
                }
            },
        }, "hyperspeed-2");

        v.color = lightColor;
        v.speedMultiplier = hyperSpeedUp;
        v.reloadMultiplier = hyperUp;
        v.damage = damage;
        v.effectChance = 0.5;
        v.effect = hyperspeedEffect;
        return v;
    })();
    const activeTime1 = 60 * 8;
    const cooldown1 = 60 * 14;
    const range2 = 26 * Vars.tilesize;
    const cooldown2 = 60 * 8;
    const damage2 = 125;
    const m = extend(UnitType, 'lightning', {
        /**
         * @returns {import('abomb4/skill-framework').SkillDefinition[]}
         */
        getSkillDefinitions() {
            const teleportColor = lightColor;
            const teleportEffect = new Effect(20, 50, cons(e => {
                // Draw.color(Pal.heal);
                // Lines.stroke(e.fout() * 2);
                // Lines.circle(e.x, e.y, 4 + e.finpow() * 65);

                Draw.color(teleportColor);
                for (let i = 0; i < 4; i++) {
                    Drawf.tri(e.x, e.y, 6, 50 * e.fout(), i * 90);
                }

                Draw.color();
                for (let i = 0; i < 4; i++) {
                    Drawf.tri(e.x, e.y, 3, 20 * e.fout(), i * 90);
                }
            }));
            const teleportSound = Sounds.plasmaboom;
            const teleportLaserType = new JavaAdapter(LaserBulletType, {
                init(b) { },
            }, damage2);
            teleportLaserType.colors = [(() => { let c = teleportColor.cpy(); c.a = 0.4; return c; })(), teleportColor, Color.white];
            teleportLaserType.hitEffect = Fx.hitLancer;
            teleportLaserType.despawnEffect = Fx.none;
            teleportLaserType.hitSize = 4;
            teleportLaserType.lifetime = 16;
            teleportLaserType.drawSize = 400;
            teleportLaserType.length = range2;
            teleportLaserType.buildingDamageMultiplier = 0.1;
            const teleportLaserEffect = new Effect(16, cons(e => {
                const lengthFalloff = 0.5;
                const width = teleportLaserType.width;
                const sideWidth = teleportLaserType.sideWidth;
                const sideLength = teleportLaserType.sideLength;
                const sideAngle = teleportLaserType.sideAngle;
                let targetX = e.data.x;
                let targetY = e.data.y;
                Tmp.v1.set(targetX, targetY).sub(e.x, e.y);
                let angle = Tmp.v1.angle();
                let baseLen = Tmp.v1.len();

                let compound = 1;
                let cwidth = teleportLaserType.width;
                Lines.lineAngle(e.x, e.y, angle, baseLen);
                for (let color of teleportLaserType.colors) {
                    Draw.color(color);
                    Lines.stroke((cwidth *= lengthFalloff) * e.fout());
                    Lines.lineAngle(e.x, e.y, angle, baseLen, false);
                    Tmp.v1.trns(angle, baseLen);
                    Drawf.tri(e.x + Tmp.v1.x, e.y + Tmp.v1.y, Lines.getStroke() * 1.22, cwidth * 2 + width / 2, angle);

                    Fill.circle(e.x, e.y, 1 * cwidth * e.fout());
                    for (let i of Mathf.signs) {
                        Drawf.tri(e.x, e.y, sideWidth * e.fout() * cwidth, sideLength * compound, angle + sideAngle * i);
                    }

                    compound *= lengthFalloff;
                }
                Draw.reset();
            }));
            return [
                {
                    name: 'hyperspeed-2',
                    icon: lib.loadRegion('hyperspeed-2'),
                    directivity: false,
                    exclusive: true,
                    activeTime: activeTime1,
                    cooldown: cooldown1,
                    aiCheck(skill, unit) {
                        // If build a block that needs 5s build time, activate
                        if (unit.isBuilding() && unit.buildPlan() != null && unit.buildPlan().block.buildCost > 5 * 60) {
                            unit.tryActiveSkill(skill.name, {});
                        }
                    },
                    active(skill, unit, data) {
                        unit.apply(statusEffect, activeTime1);

                        // Try active skill if serval Collapse under control
                        unit.controlling.each(cons(mem => {
                            if (mem.type == unit.type) {
                                mem.tryActiveSkill(this.name, data);
                            }
                        }));
                    },
                },
                {
                    name: 'flash',
                    range: range2,
                    icon: lib.loadRegion('flash'),
                    cooldown: cooldown2,
                    directivity: true,
                    activeTime: -1,
                    active(skill, unit, data) {
                        let x = unit.x;
                        let y = unit.y;
                        teleportEffect.at(unit.x, unit.y);
                        teleportSound.at(unit.x, unit.y, Mathf.random(0.9, 1.1));
                        let targetX = data.x;
                        let targetY = data.y;
                        Tmp.v1.set(targetX, targetY).sub(unit.x, unit.y);
                        let angle = Tmp.v1.angle();
                        Tmp.v1.setLength(Math.min(skill.def.range, Tmp.v1.len()));
                        let len = Tmp.v1.len();
                        unit.x += Tmp.v1.x;
                        unit.y += Tmp.v1.y;
                        unit.snapInterpolation();
                        teleportEffect.at(unit.x, unit.y);
                        teleportSound.at(unit.x, unit.y, Mathf.random(0.9, 1.1));
                        lib.damageLine(teleportLaserType.create(unit, x, y, angle), unit.team, Fx.hitLancer, x, y, angle, len, false, "pierce");
                        // draw using effect
                        teleportLaserEffect.at(x, y, 0, {x: unit.x, y: unit.y});
                        // Try active skill if serval Collapse under control
                        unit.controlling.each(cons(mem => {
                            if (mem.type == unit.type) {
                                mem.tryActiveSkill(this.name, data);
                            }
                        }));
                    },
                },
            ];
        },
        load() {
            this.super$load();
            this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description", [
                cooldown1 / 60,
                activeTime1 / 60,
                damage * 60,
                hyperSpeedUp * 100,
                hyperUp * 100,      // atk
                hyperUp * 100,      // mining
                hyperUp * 100,      // build
                cooldown2 / 60,
                range2 / Vars.tilesize,
                damage2
            ]);
        },
    });

    m.constructor = flyingConstructor;

    m.defaultController = prov(() => new BuilderAI());
    m.flying = true;
    m.lowAltitude = true;
    m.mineSpeed = 10;
    m.mineTier = 3;
    m.buildSpeed = 1.4;
    m.drag = 0.05;
    m.speed = 3.55;
    m.armor = 2;
    m.rotateSpeed = 17;
    m.accel = 0.11;
    m.itemCapacity = 100;
    m.health = 325;
    m.engineOffset = 8;
    m.engineSize = 4;
    m.hitSize = 15;
    m.payloadCapacity = (2 * 2) * Vars.tilePayload;
    m.commandLimit = 8;

    m.weapons.add(
        (() => {
            const w = new Weapon();
            w.top = false;
            w.reload = 24;
            w.x = 0;
            w.y = 2;
            w.shots = 3;
            w.spacing = 1;
            w.shotDelay = 4;
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
                }, 5, 12);
                b.width = 7;
                b.height = 11;
                b.lifetime = 50;
                b.homingRange = 4 * 8;
                b.homingPower = 0.16;
                b.backColor = lightColor;
                b.hitEffect = fxHitBulletSmall;
                b.despawnEffect = fxHitBulletSmall;
                b.lightning = 1;
                b.lightningLength = 2;
                b.lightningLengthRand = 8;
                b.lightningColor = lightColor;
                b.lightningDamage = 6;
                b.lightningType = (() => {
                    const btt = new JavaAdapter(BulletType, {}, 0.0001, 0);
                    btt.lifetime = Fx.lightning.lifetime;
                    btt.hitEffect = Fx.hitLancer;
                    btt.despawnEffect = Fx.none;
                    btt.status = StatusEffects.shocked;
                    btt.statusDuration = 10;
                    btt.hittable = false;
                    btt.buildingDamageMultiplier = 0.05;
                    return btt;
                })();
                b.shootEffect = Fx.shootSmall;
                b.smokeEffect = Fx.shootSmallSmoke;
                b.buildingDamageMultiplier = 0.05;
                return b;
            })();
            return w;
        })()
    )
    return m;
})();

exports.lightning = unitType;
