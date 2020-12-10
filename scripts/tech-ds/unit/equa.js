const lib = require('abomb4/lib')
const { newDeflectForceFieldAbility } = require('abomb4/abilities');

const unitType = (() => {
    const m = extendContent(UnitType, 'equa', {

    });

    m.constructor = prov(() => extend(UnitTypes.oct.constructor.get().class, {
    }));

    m.armor = 16;
    m.health = 22000;
    m.speed = 0.8;
    m.rotateSpeed = 1;
    m.accel = 0.04;
    m.drag = 0.018;
    m.flying = true;
    m.engineOffset = 46;
    m.engineSize = 7.8;
    m.rotateShooting = false;
    m.hitSize = 60;
    m.payloadCapacity = (5.3 * 5.3) * Vars.tilePayload;
    m.buildSpeed = 4;
    m.drawShields = false;
    m.commandLimit = 6;
    m.lowAltitude = true;

    m.ammoCapacity = 1300;
    m.ammoResupplyAmount = 20;

    m.abilities.add(
        newDeflectForceFieldAbility({
            radius: 140,
            regen: 4,
            max: 6500,
            cooldown: 60 * 8
        }),
        new ShieldRegenFieldAbility(80, 160, 60 * 3, 140)
    );

    return m;
})();

exports.equa = unitType;
