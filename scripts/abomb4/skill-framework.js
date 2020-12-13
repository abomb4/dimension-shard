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
    var marginBottom = 0;

    function trySelectSkill(index) {
        if (skillList && skillList.length > index) {
            const skill = skillList[index];
            if (skill.reload >= skill.def.cooldown) {
                selectSkill = selectSkill == index ? -1 : index;
                rebuild();
            }
        }
    }
    function notClickedAtOtherFrag() {
        return !Core.scene.hit(Core.input.mouseX(), Core.input.mouseY(), true);
    }
    function haveKeyboard() {
        // TODO
        return true;
    }
    // Seems not possible to implement Application Listener, so uses ApplicationCore
    const listener = new JavaAdapter(ApplicationCore, {
        update: function() {
            if (Vars.state.state == GameState.State.playing && skillList) {
                if (selectSkill >= 0 && Core.input.keyTap(Binding.select) && notClickedAtOtherFrag()) {
                    var skill = skillList[selectSkill];
                    if (skill) {
                        Vars.player.unit().activeSkill(skill.def.name, {
                            x: Core.input.mouseWorldX(),
                            y: Core.input.mouseWorldY(),
                        }, false);
                    }
                    selectSkill = -1;
                    rebuild();
                } else if (Core.input.keyRelease(Binding.break_block) || Core.input.keyRelease(Binding.schematic_select) || Core.input.keyTap(Binding.clear_building)) {
                    // var is80 = Vars.control.input.lastSchematic || (Vars.ui.hudfrag.shown && Core.settings.getBool("hints") && Vars.player.unit().isBuilding());
                    // var m = is80 ? 80 : 0;
                    // if (m != marginBottom) {
                    //     marginBottom = m;
                    //     rebuild();
                    // }
                } else if (haveKeyboard()) {
                    if (Core.input.keyTap(Packages.arc.input.KeyCode.f1)) {
                        trySelectSkill(0);
                    } else if (Core.input.keyTap(Packages.arc.input.KeyCode.f2)) {
                        trySelectSkill(1);
                    } else if (Core.input.keyTap(Packages.arc.input.KeyCode.f3)) {
                        trySelectSkill(2);
                    } else if (Core.input.keyTap(Packages.arc.input.KeyCode.f4)) {
                        trySelectSkill(3);
                    }
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
    const unfinish = new Color(0, 0, 0, 0.3);
    const finish = new Color(0, 0, 0, 0.8);
    const disabledColor = new Color(1, 1, 1, 0.4);
    fragment = new JavaAdapter(Fragment, {
        build(parent) {
            parent.fill(cons(full => {
                toggler = full;
                full.center().left().marginBottom(marginBottom).visibility = boolp(() => Vars.state.isGame() && Vars.ui.hudfrag.shown && skillList);

                if (skillList) {
                    for (var i in skillList) {
                        ((index) => {
                            const skill = skillList[index];
                            const imageStyle = new ImageButton.ImageButtonStyle();
                            imageStyle.down = Styles.flatDown;
                            imageStyle.up = Styles.black;
                            imageStyle.over = Styles.flatOver;
                            imageStyle.imageDisabledColor = disabledColor;
                            imageStyle.imageUpColor = Color.white;
                            imageStyle.disabled = Styles.black3;
                            imageStyle.checked = Styles.flatDown;

                            var disabled = new JavaAdapter(TextureRegionDrawable, {
                                draw(x, y, width, height) {
                                    var cooldownProgress = skill.reload / skill.def.cooldown;
                                    // draw top
                                    var cooldownProgressNega = (1 - cooldownProgress)
                                    Draw.color(Tmp.c1.set(unfinish).toFloatBits());
                                    Draw.rect(this.region, x + width / 2.0, y + height - height * cooldownProgressNega / 2, width, height * cooldownProgressNega);

                                    // draw bottom
                                    Draw.color(Tmp.c1.set(finish).toFloatBits());
                                    Draw.rect(this.region, x + width / 2.0, y + height * cooldownProgress / 2, width, height * cooldownProgress);

                                    // Maybe draw a seconds left?
                                },
                            });
                            disabled.region = Tex.whiteui.region;
                            imageStyle.disabled = disabled;

                            const skillButton = new JavaAdapter(ImageButton, {
                                draw() {
                                    this.super$draw();
                                    var width = 16;
                                    var height = 16;
                                    Draw.color(new Color(1, 1, 1, 0.6));
                                    Draw.rect(lib.loadRegion('f1'), this.x + 4 + width / 2.0, this.y + this.getHeight() - 4 - height / 2, width, height);
                                },
                            }, skill.def.icon, imageStyle);
                            skillButton.changed(run(() => {
                                selectSkill = selectSkill == index ? -1 : index;
                                rebuild();
                            }));
                            full.add(skillButton).update(cons(v => {
                                v.setChecked(selectSkill == index);
                                v.setDisabled(skill.reload < skill.def.cooldown);
                            })).width(80).height(80);
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
            update() {
                this.super$update();
                if (statusList) {
                    statusList.forEach(skill => {
                        skill.reload = Math.min(skill.def.cooldown, skill.reload + Time.delta);
                    });
                }
            },
            classId() { return classId; },
            isSkilled() { return statusList.length > 0; },
            activeSkill(skillName, data, fromServer) {
                const skill = skillStatusMap[skillName];
                // print('skill: ' + skillName + ', reload: ' + skill.reload + ', skill.def.cooldown: ' + skill.def.cooldown);
                if (skill && skill.reload >= skill.def.cooldown) {
                    skill.def.active(skill, this, data);
                    skill.reload = 0;
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
