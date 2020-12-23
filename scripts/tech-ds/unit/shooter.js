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
const { flyingConstructor } = require('abomb4/skill-framework');

const unitType = (() => {
    const m = extendContent(UnitType, 'shooter', {
        getSkillDefinitions() {
            return [
            ];
        },
    });

    m.constructor = flyingConstructor;

    m.armor = 10;
    m.health = 16000;
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
            const w = new Weapon(lib.modName + "-shooter-gun");
            w.shake = 4;
            w.shots = 20;
            w.shotDelay = 0.3;
            w.inaccuracy = 0;
            w.shootY = 9;
            w.x = 18;
            w.y = 5;
            w.rotateSpeed = 4;
            w.reload = 15;
            w.recoil = 4;
            w.shootSound = Blocks.salvo.shootSound;
            w.shadow = 20;
            w.rotate = true;
            w.bullet = (() => {
                const v2 = new BasicBulletType(3.5, 22);
                v2.lifetime = Bullets.standardThorium.lifetime;
                v2.ammoMultiplier = 4;
                v2.width = Bullets.standardThorium.width;
                v2.height = Bullets.standardThorium.height;
                v2.frontColor = Bullets.standardThorium.frontColor;
                v2.backColor = Bullets.standardThorium.backColor;
                v2.pierceCap = 2;
                v2.pierceBuilding = false;
                // v.status = StatusEffects.blasted;
                return v2;
            })();
            return w;
        })()
    )

    const puddles = 40;
    const puddleRange = 30;
    const puddleAmount = 20;
    const puddleLiquid = items.ionLiquid;
    const lightning = 16;
    const lightningDamage = 22;
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
