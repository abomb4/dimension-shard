const lib = require('abomb4/lib')
const items = require('ds-common/items')
const { newDeflectForceFieldAbility } = require('abomb4/abilities');
const { newIonBoltBulletType } = require('ds-common/bullet-types');
const { flyingConstructor } = require('abomb4/skill-framework');

const unitType = (() => {
    const m = extendContent(UnitType, 'burn', {
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
            const w = new Weapon(lib.modName + "-burn-ion-cannon");
            w.shake = 4;
            w.shootY = 9;
            w.x = 18;
            w.y = 5;
            w.rotateSpeed = 4;
            w.reload = 40;
            w.recoil = 4;
            w.shootSound = lib.loadSound('ion-shot');
            w.shadow = 20;
            w.rotate = true;
            w.bullet = newIonBoltBulletType({
                speed: 4.6
            });
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
