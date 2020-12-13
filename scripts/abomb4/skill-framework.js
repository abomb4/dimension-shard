const lib = require('abomb4/lib');

/*
Skill Framework.

1. Define skills at unit define place
2. When play controlls the unit, show hud
3. AI automatically use skills, by some logic
4. save and load

Skill can:
1. modify unit properties like:
  - speed
  - weapon reload time
2. When skill running:
  - May disable moving
  - May disable shooting
  - May disable other skills
3. Skills can do:
  - Move units
  - Create bullets
  - affect nearby units
 */

var skill = {
    def: {
        name: 'batch-teleport',
        cooldown: 60 * 10,
        icon: Icon.eyeSmall,
    },
    reload: 0,
};

const skillFrag = (() => {

    var selectSkill = -1;
    var skillList;
    var fragment;
    var toggler;

    function notClickedAtOtherFrag() {
        return !Core.scene.hit(Core.input.mouseX(), Core.input.mouseY(), true);
    }
    // Seems not possible to implement Application Listener, so uses ApplicationCore
    const listener = new JavaAdapter(ApplicationCore, {
        update: function() {
            if (Vars.state.state == GameState.State.playing) {
                if (selectSkill >= 0 && Core.input.keyTap(Binding.select) && notClickedAtOtherFrag()) {
                    var skill = skillList[selectSkill];
                    if (skill) {
                        Vars.player.unit().activeSkill(skill.def.name, {
                            x: Core.input.mouseWorldX(),
                            y: Core.input.mouseWorldY(),
                        });
                    }
                    selectSkill = -1;
                    rebuild();
                }
            }
        },
    });
    Events.on(ClientLoadEvent, cons(event => {
        Vars.platform.add(listener);
    }));

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
                full.center().bottom().visibility = boolp(() => Vars.state.isGame() && Vars.ui.hudfrag.shown);

                if (skillList) {
                    for (var i in skillList) {
                        ((index) => {
                            const skill = skillList[index];
                            full.button(skill.def.icon, Styles.clearTogglei, run(() => {
                                selectSkill = selectSkill == index ? -1 : index;
                                rebuild();
                            })).update(cons(v => v.setChecked(selectSkill == index))).width(80).height(80);
                        })(i);
                    }
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
    Events.on(UnitChangeEvent, cons(event => {
        // Build fragments by unit
        print('change to unit: ' + event.unit + ', getSkills: ' + event.unit.getSkills);
        if (event.unit.getSkills) {
            const sk = event.unit.getSkills();
            skillList = sk;
        } else {
            skillList = undefined;
        }
        rebuild();
    }));
    return fragment;
})();

/**
 * To use this consturctor, the UnitType must define 'getSkillDefinitions()'.
 */
function _define_constructor_(clazz, classId) {
    var construct = prov(() => {
        const skillStatusMap = {
        };
        var skillInited = false;
        const statusList = [];

        function initSkill(unit) {
            if (!skillInited) {
                var definitions;
                if (unit.type.getSkillDefinitions && (definitions = unit.type.getSkillDefinitions())) {
                    for (var def of definitions) {
                        var skillStatus = {
                            def: def,
                            reload: def.cooldown,
                        };
                        statusList.push(skillStatus);
                        skillStatusMap[def.name] = skillStatus;
                    }
                }
                skillInited = true;
            }
        }
        var u = new JavaAdapter(clazz, {
            getSkills() {
                initSkill(this);
                return statusList;
            },
            add() {
                initSkill(this);
                this.super$add();
            },
            remove() {
                this.super$remove();
                for (var i in skillStatusMap) {
                    delete skillStatusMap[i];
                }
                while (statusList.pop() !== undefined) {}
            },
            classId() { return classId; },
            isSkilled() { return statusList.length > 0; },
            activeSkill(skillName, data) {
                const skill = skillStatusMap[skillName];
                // print('skill: ' + skillName + ', reload: ' + skill.reload + ', skill.def.cooldown: ' + skill.def.cooldown);
                if (skill && skill.reload >= skill.def.cooldown) {
                    skill.def.active(skill, this, data);
                }
            },
        });
        return u;
    });
    EntityMapping.idMap[classId] = construct;
    return construct;
}
exports.flyingConstructor = _define_constructor_(UnitEntity, 50);
exports.mechConstructor = _define_constructor_(MechUnit, 51);
exports.legsConstructor = _define_constructor_(LegsUnit, 52);
exports.navalConstructor = _define_constructor_(UnitWaterMove, 53);
exports.payloadConstructor = _define_constructor_(PayloadUnit, 54);
