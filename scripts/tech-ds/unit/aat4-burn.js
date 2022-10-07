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
const { standardIonBolt1 } = require('ds-common/bullet-types/index');
const { flyingConstructor } = require('abomb4/skill-framework');

const unitType = (() => {
    const m = extend(UnitType, 'burn', {
        getSkillDefinitions() {
            return [
            ];
        },
    });

    m.constructor = flyingConstructor;

    m.armor = 8;
    m.health = 6400;
    m.speed = 0.75;
    m.rotateSpeed = 2;
    m.accel = 0.04;
    m.drag = 0.04;
    m.flying = true;
    m.engineOffset = 28;
    m.engineSize = 7.8;
    m.rotateShooting = false;
    m.hitSize = 54;
    m.lowAltitude = true;
    m.targetFlag = BlockFlag.turret;
    m.destructibleWreck = false;
    m.circleTarget = true;
    m.faceTarget = true;

    // m.abilities.add(
    //     newDeflectForceFieldAbility({
    //         radius: 140,
    //         regen: 4,
    //         max: 6500,
    //         cooldown: 60 * 8
    //     })
    // );
    m.weapons.add(
        (() => {
            const w = new Weapon(lib.modName + "-burn-ion-cannon");
            w.shake = 4;
            w.shootY = 9;
            w.shoot.shots = 3;
            w.shoot.shotDelay = 4;
            w.x = 15;
            w.y = 6;
            w.rotateSpeed = 4;
            w.reload = 50;
            w.recoil = 4;
            w.shootSound = lib.loadSound('ion-shot');
            w.shadow = 20;
            w.rotate = true;
            w.bullet = standardIonBolt1;
            return w;
        })()
    )

    const puddles = 36;
    const puddleRange = 24;
    const puddleAmount = 16;
    const puddleLiquid = items.ionLiquid;
    const lightning = 12;
    const lightningDamage = 20;
    const lightningLength = 24;
    const lightningLengthRand = 8;
    Events.on(UnitDestroyEvent, cons(event => {
        if (event.unit.type === m) {
            // Ion Liquid leak, and flame
            var x = event.unit.x;
            var y = event.unit.y;
            for (var i = 0; i < puddles; i++) {
                var tile = Vars.world.tileWorld(x + Mathf.range(puddleRange), y + Mathf.range(puddleRange));
                Puddles.deposit(tile, puddleLiquid, puddleAmount);
                if (i < 3) {
                    Fires.create(tile);
                }
            }
            // Lightning hit everyone
            for (var i = 0; i < lightning; i++) {
                Lightning.create(Team.derelict, items.ionLiquid.color, lightningDamage, x, y, Mathf.random(360), lightningLength + Mathf.random(lightningLengthRand));
            }
        }
    }));
    return m;
})();

exports.burn = unitType;
