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
const { newSurroundingElectricBall } = require('ds-common/bullet-types/index');
const { flyingConstructor } = require('abomb4/skill-framework');

const unitType = (() => {
    const m = extendContent(UnitType, 'formula', {
        getSkillDefinitions() {
            return [
            ];
        },
    });

    m.constructor = flyingConstructor;

    m.defaultController = prov(() => new BuilderAI());
    m.armor = 10;
    m.health = 5000;
    m.speed = 2.5;
    m.rotateSpeed = 2.2;
    m.accel = 0.06;
    m.drag = 0.017;
    m.flying = true;
    m.engineOffset = 12;
    m.engineSize = 6;
    m.buildSpeed = 3.7;
    m.itemCapacity = 150;
    m.mineTier = 4;
    m.mineSpeed = 10;
    m.rotateShooting = false;
    m.hitSize = 32;
    m.lowAltitude = true;
    m.payloadCapacity = (3 * 3) * Vars.tilePayload;
    m.ammoType = AmmoTypes.powerHigh;

    const fxCharge = Fx.greenLaserChargeSmall;
    m.weapons.add(
        (() => {
            const w = new Weapon();
            w.shake = 4;
            w.shots = 8;
            w.spacing = 360 / w.shots;
            w.shotDelay = 0;
            w.firstShotDelay = fxCharge.lifetime - 1;
            w.inaccuracy = 0;
            w.shootY = 0;
            w.shootY = 0;
            w.x = 0;
            w.y = 0;
            w.mirror = false;
            w.reload = 10 * 60;
            w.recoil = 0;
            w.shootSound = Blocks.salvo.shootSound;
            w.shootCone = 360;
            w.rotate = false;
            w.bullet = newSurroundingElectricBall({
                lightningColor: items.ionLiquid.color,
                frontColor: items.ionLiquid.color,
                shootEffect: fxCharge,
                status: items.ionBurningEffect,
                statusDuration: 60,
                lifetime: 5 * 60
            });
            return w;
        })()
    )
    return m;
})();

exports.formula = unitType;
