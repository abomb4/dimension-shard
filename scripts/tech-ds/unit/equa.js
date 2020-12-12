const lib = require('abomb4/lib')
const { newDeflectForceFieldAbility } = require('abomb4/abilities');
const { payloadConstructor } = require('abomb4/skill-framework');

const skilledMap = {

};
Events.on(UnitDestroyEvent, cons(e => {
    const unit = e.unit;
    delete unit.id;
}));
const unitType = (() => {
    const m = extendContent(UnitType, 'equa', {
        getSkillDefinitions() {
            return [
                {
                    name: 'teleport',
                    range: 200,
                    icon: Icon.githubSquare,
                    cooldown: 60 * 2,
                    active(skill, unit, data) {
                        var targetX = data.x;
                        var targetY = data.y;
                        Tmp.v1.set(targetX, targetY).sub(unit.x, unit.y);
                        Tmp.v1.setLength(Math.min(skill.def.range, Tmp.v1.len()));
                        unit.x += Tmp.v1.x;
                        unit.y += Tmp.v1.y;
                        // find commands
                        unit.controlling.each(cons(mem => { mem.x += Tmp.v1.x; mem.y += Tmp.v1.y; }));
                    },
                    update() {},
                }
            ];
        },
    });

    m.constructor = payloadConstructor;

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
        })
    );

    return m;
})();

exports.equa = unitType;
