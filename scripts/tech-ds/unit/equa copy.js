const lib = require('abomb4/lib')
const { newDeflectForceFieldAbility } = require('abomb4/abilities');

const skilledMap = {

};
Events.on(UnitDestroyEvent, cons(e => {
    const unit = e.unit;
    delete unit.id;
}));
const unitType = (() => {
    const m = extendContent(UnitType, 'equa', {});

    m.constructor = (() => {
        const CLASS_ID = 50;
        var construct = prov(() => {
            const skill = {
                reloadTime: 120,
                reload: 120,
                range: 200,
            };
            var u = new JavaAdapter(UnitTypes.oct.constructor.get().class, {
                add() {
                    skilledMap[this.id] = this;
                    print('skilledMap['+this.id+']: ' + this);
                    this.super$add();
                },
                classId() { return CLASS_ID; },
                isSkilled() { return true; },
                activeSkill(skillName, data) {
                    if (skill.reload >= skill.reloadTime) {
                        // teleport
                        ((unit, skill, data) => {
                            var targetX = data.x;
                            var targetY = data.y;
                            Tmp.v1.set(targetX, targetY).sub(unit.x, unit.y);
                            Tmp.v1.setLength(Math.min(skill.range, Tmp.v1.len()));
                            unit.x += Tmp.v1.x;
                            unit.y += Tmp.v1.y;
                            // find commands
                            this.controlling.each(cons(mem => { mem.x += Tmp.v1.x; mem.y += Tmp.v1.y; }));
                        })(this, skill, data);
                    }
                },
            });
            return u;
        });
        EntityMapping.idMap[CLASS_ID] = construct;
        return construct;
    })();

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

const skillFrag = (() => {

    var selectSkill = false;
    var fragment;
    var toggler;

    const SkillFramework = (() => {
        // aaaaaaaaaaaaaa
        const listener = new JavaAdapter(ApplicationCore, {
            update: function() {
                if (Vars.state.state == GameState.State.playing) {
                    if (selectSkill && Core.input.keyDown(Binding.select)) {
                        selectSkill = false;
                        var sku = skilledMap[Vars.player.unit().id];
                        print('skilledMap['+Vars.player.unit().id+']: ' + sku);
                        if (sku) {
                            sku.activeSkill("teleport", {
                                x: Core.input.mouseWorldX(),
                                y: Core.input.mouseWorldY(),
                            });
                        }
                        rebuild();
                    }
                }
            },
        });
        Events.on(ClientLoadEvent, cons(event => {
            Vars.platform.add(listener);
            print('add lisntenr!' + listener);
        }));
        return listener;
    })();

    function rebuild() {
        if (fragment) {
            var index = toggler.getZIndex();
            var group = toggler.parent;
            toggler.remove();
            fragment.build(group);
            toggler.setZIndex(index);
        }
    }
    fragment = new JavaAdapter(Fragment, {
        build(parent) {
            parent.fill(cons(full => {
                toggler = full;
                full.center().bottom().visibility = boolp(() => Vars.ui.hudfrag.shown);

                if (!selectSkill) {
                    full.button(Icon.eyeSmall, run(() => {
                        selectSkill = true;
                        rebuild();
                    })).width(50).height(50);
                } else {
                    full.button(Icon.downOpen, run(() => {
                        selectSkill = false;
                        rebuild();
                    })).width(50).height(50);
                }
            }));
        },
    });
    Events.on(ClientLoadEvent, cons(event => {
        fragment.build(Vars.ui.hudGroup);
    }));
    Events.on(WorldLoadEvent, cons(event => {
        Core.app.post(run(() => {
            rebuild();
        }));
    }));
    return fragment;
})();

exports.equa = unitType;
