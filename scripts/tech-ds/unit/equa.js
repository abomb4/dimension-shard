const lib = require('abomb4/lib')
const { newDeflectForceFieldAbility } = require('abomb4/abilities');
const { payloadConstructor } = require('abomb4/skill-framework');

const unitType = (() => {
    const m = extendContent(UnitType, 'equa', {
        getSkillDefinitions() {
            const teleportColor = Color.valueOf("69dcee");
            const teleportEffect = new Effect(40, 100, cons(e => {
                // Draw.color(Pal.heal);
                // Lines.stroke(e.fout() * 2);
                // Lines.circle(e.x, e.y, 4 + e.finpow() * 65);

                Draw.color(teleportColor);
                for (var i = 0; i < 4; i++) {
                    Drawf.tri(e.x, e.y, 6, 100 * e.fout(), i * 90);
                }

                Draw.color();
                for (var i = 0; i < 4; i++) {
                    Drawf.tri(e.x, e.y, 3, 35 * e.fout(), i * 90);
                }
            }));
            const teleportSound = Sounds.plasmaboom;
            return [
                {
                    name: 'teleport',
                    range: 200,
                    icon: lib.loadRegion('teleport'),
                    cooldown: 60 * 2,
                    active(skill, unit, data) {
                        teleportEffect.at(unit.x, unit.y);
                        teleportSound.at(unit.x, unit.y, Mathf.random(0.9, 1.1));
                        var targetX = data.x;
                        var targetY = data.y;
                        Tmp.v1.set(targetX, targetY).sub(unit.x, unit.y);
                        Tmp.v1.setLength(Math.min(skill.def.range, Tmp.v1.len()));
                        unit.x += Tmp.v1.x;
                        unit.y += Tmp.v1.y;
                        teleportEffect.at(unit.x, unit.y);
                        teleportSound.at(unit.x, unit.y, Mathf.random(0.9, 1.1));
                        // find commands
                        unit.controlling.each(cons(mem => {
                            teleportEffect.at(mem.x, mem.y);
                            teleportSound.at(mem.x, mem.y, Mathf.random(0.9, 1.1));
                            mem.x += Tmp.v1.x;
                            mem.y += Tmp.v1.y;
                            teleportEffect.at(mem.x, mem.y);
                            teleportSound.at(mem.x, mem.y, Mathf.random(0.9, 1.1));
                        }));
                    },
                    update() { },
                }
            ];
        },
    });

    m.constructor = payloadConstructor;

    m.armor = 15;
    m.health = 20000;
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
