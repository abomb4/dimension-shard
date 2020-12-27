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

/** Send packet, assume skill is fired in local */
const Call_ActiveSkill = (() => {
    const TYPE = 'sfActiveSkill';
    const DELIMITER = ', ';

    function makePackage(unit, skillName, data) {
        // return JSON.stringify([unit.id, skillName, { x: data.x, y: data.y }]);
        const datas = unit.id + DELIMITER + skillName + DELIMITER + data.x + DELIMITER + data.y;
        return datas;
    }

    /**
     * Read packet to objects
     *
     * @param {string} str the packet
     * @returns {{unit: Unit, skillName: string, data: SkillData}} contains 3
     */
    function readPackage(str) {
        const datas = str.split(DELIMITER);
        const unitId = datas[0];
        const skillName = datas[1];
        const dataX = datas[2];
        const dataY = datas[3];
        // find unit by id
        const unit = Groups.unit.getByID(unitId);
        return {
            unit: unit == null ? Nulls.unit : unit,
            skillName: skillName,
            data: { x: dataX, y: dataY }
        };
    }

    /** Forwawd to other clients */
    function forwardPackage(player, pack) {
        // Send to EVERY client if i'm server except sender
        // FIXME This is not
        Call.clientPacketReliable(TYPE, pack);
    }

    /** Client receives skill active packet, deal self */
    Vars.netClient.addPacketHandler(TYPE, cons(pack => {
        const info = readPackage(pack);
        if (info.unit != null && info.unit.activeSkill !== undefined) {
            // Avoid twice active
            if (Vars.player.unit() == info.unit) { return; }
            info.unit.activeSkill(info.skillName, info.data, true);
        }
    }));

    /** Server receives skill active packet, deal self and forward packet */
    Vars.netServer.addPacketHandler(TYPE, lib.cons2((player, pack) => {
        const info = readPackage(pack);
        if (info.unit != null && info.unit.activeSkill !== undefined) {
            info.unit.activeSkill(info.skillName, info.data, true);
            forwardPackage(player, pack);
        }
    }));

    return (unit, skillName, data) => {
        const pack = makePackage(unit, skillName, data);
        // Send to EVERY client if i'm server
        Call.clientPacketReliable(TYPE, pack);
        // Send to  THE  server if i'm client
        Call.serverPacketReliable(TYPE, pack);
    }
})();

const skillFrag = (() => {

    var selectSkill = -1;
    /** @type {SkillStatus[]} */
    var skillList;
    var fragment;
    var toggler;
    var marginBottom = 0;

    const fIcons = [];

    function activeSkill(index) {
        if (index === undefined) { index = selectSkill; }
        var skill = skillList[index];
        if (skill) {
            Vars.player.unit().tryActiveSkill(skill.def.name, {
                x: Core.input.mouseWorldX(),
                y: Core.input.mouseWorldY(),
            });
        }
        selectSkill = -1;
    }
    function trySelectSkill(index) {
        if (skillList && skillList.length > index) {
            const skill = skillList[index];
            if (skill.reload >= skill.def.cooldown) {
                if (skill.def.activeTime <= 0) {
                    selectSkill = selectSkill == index ? -1 : index;
                } else {
                    // ACTIVE IT
                    selectSkill == index;
                    activeSkill(index);
                }
                rebuild();
            }
        }
    }
    function notClickedAtOtherFrag() {
        return !Core.scene.hit(Core.input.mouseX(), Core.input.mouseY(), true);
    }
    function haveKeyboard() {
        return !Vars.mobile;
    }
    // Seems not possible to implement Application Listener, so uses ApplicationCore
    const listener = new JavaAdapter(ApplicationCore, {
        update: function() {
            if (Vars.state.state == GameState.State.playing && skillList) {
                if (selectSkill >= 0 && Core.input.keyTap(Binding.select) && notClickedAtOtherFrag()) {
                    activeSkill();
                    rebuild();
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
        fIcons.push(lib.loadRegion('f1'));
        fIcons.push(lib.loadRegion('f2'));
        fIcons.push(lib.loadRegion('f3'));
        fIcons.push(lib.loadRegion('f4'));
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
                full.center().left().marginBottom(marginBottom).visibility = boolp(() => Vars.state.isGame() && Vars.ui.hudfrag.shown && skillList != undefined);

                if (skillList) {
                    for (var i in skillList) {
                        ((index) => {
                            /** @type {SkillStatus} */
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
                                    if (haveKeyboard()) {
                                        Draw.rect(fIcons[index], this.x + 4 + width / 2.0, this.y + this.getHeight() - 4 - height / 2, width, height);
                                    }
                                },
                            }, skill.def.icon, imageStyle);
                            skillButton.changed(run(() => {
                                trySelectSkill(index);
                                rebuild();
                            }));
                            full.add(skillButton).update(cons(v => {
                                v.setChecked(selectSkill == index);
                                v.setDisabled(skill.reload < skill.def.cooldown);
                            })).width(80).height(80);
                            full.row()
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
        if (!Vars.headless && Vars.player && Vars.player.unit() == event.unit) {
            if (event.unit.getSkills) {
                const sk = event.unit.getSkills();
                skillList = sk;
            } else {
                skillList = undefined;
            }
            rebuild();
        }
    }));
    return fragment;
})();

/**
 * Data when skill activated.
 *
 * @typedef {Object} Data
 * @typedef {number} x x position
 * @typedef {number} y y position
 */

/**
 * Skill Definition.
 * @typedef {Object} SkillDefinition
 * @property {string} name - Unique in one unit type, must not empty
 * @property {number} cooldown - Not empty, you may need someNumber * 60.
 * @property {TextureRegion} icon - Not empty, instance of TextureRegion, use lib.loadRegion
 * @property {boolean} directivity - Should choose target.
 * @property {boolean} exclusive - Usage for continously skill, if true, other skills cannot activate during active time.
 * @property {number} activeTime - If the skill is continously skill, set to greeter than zero
 * @property {function(SkillStatus, Unit, Data)} active - Not empty, active function
 * @property {function(SkillStatus, Unit, boolean)} preUpdate - For continously skill; 3rd param is 'isLastFrame'
 * @property {function(SkillStatus, Unit, boolean)} postUpdate - For continously skill; 3rd param is 'isLastFrame'
 * @property {function(SkillStatus, Unit, boolean)} draw - For continously skill; 3rd param is 'isLastFrame'
 * @property {function(SkillStatus, Unit, number) => number} updateDamage - Update damage, return new damage value; 3rd param is damage.
 */

/**
 * Skill status.
 * @typedef {Object} SkillStatus
 * @property {SkillDefinition} def - Definition of skill
 * @property {number} reload - Reload, def.cooldown means ready
 * @property {boolean} active - Is active, will run update() when active, set by SkillStatus#active
 * @property {number} activeTimeLeft - If it's continously skill, set by SkillStatus#active;
 * @property {number} numValue1 - Ugly, but useful, maybe.
 * @property {number} numValue2 - Ugly, but useful, maybe.
 * @property {number} numValue3 - Ugly, but useful, maybe.
 * @property {number} numValue4 - Ugly, but useful, maybe.
 */

/*
{
    name: 'damage-deflection',
    range: 20,
    icon: lib.loadRegion('teleport'),
    directivity: false,
    exclusive: false,
    activeTime: 60 * 3,
    cooldown: 60 * 30,
    active(skill, unit, data) {
        Fx.heal.at(unit.x, unit.y);
    },
    preUpdate(skill, unit, lastFrame) {
    },
    postUpdate(skill, unit, lastFrame) {
    },
    draw(skill, unit, lastFrame) {
    },
    updateDamage(skill, unit, amount) {
        return amount;
    },
},
*/

/**
 * To use this consturctor, the UnitType must define 'getSkillDefinitions()'.
 */
function _define_constructor_(clazz, classId) {
    var construct = prov(() => {
        /** @type {{[key: string]: SkillStatus}} */
        const skillStatusMap = {
        };
        var skillInited = false;
        /** @type {SkillStatus[]} */
        const statusList = [];

        function initSkill(unit) {
            if (!skillInited) {
                var definitions;
                if (unit.type.getSkillDefinitions && (definitions = unit.type.getSkillDefinitions())) {
                    for (var def of definitions) {
                        var skillStatus = {
                            // Definition
                            def: def,
                            // Reload, def.cooldown means ready
                            reload: def.cooldown,
                            // is active
                            active: false,
                            // continously skill time left
                            activeTimeLeft: 0,
                            numValue1: 0,
                            numValue2: 0,
                            numValue3: 0,
                            numValue4: 0,
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
                if (statusList) {
                    statusList.forEach(status => {
                        if (status.active) {
                            status.activeTimeLeft -= Time.delta;
                            if (status.def.preUpdate) {
                                status.def.preUpdate(status, this, status.activeTimeLeft <= 0);
                            }
                        }
                    });

                    this.super$update();

                    statusList.forEach(status => {
                        if (status.active) {
                            var last = status.activeTimeLeft <= 0;
                            if (status.def.postUpdate) {
                                status.def.postUpdate(status, this, last);
                            }
                            status.active = !last;
                        } else {
                            status.reload = Math.min(status.def.cooldown, status.reload + Time.delta);
                        }
                    });
                } else {
                    this.super$update();
                }
            },
            damage(amount, withEffect) {
                // If some actived skill handles damage, filter it
                for (var status of statusList) {
                    if (status.active && status.def.updateDamage) {
                        amount = status.def.updateDamage(status, this, amount);
                    }
                }
                if (withEffect === undefined) {
                    this.super$damage(amount);
                } else {
                    this.super$damage(amount, withEffect);
                }
            },
            draw() {
                this.super$draw();
                statusList.forEach(status => {
                    if (status.active && status.def.draw) {
                        status.def.draw(status, this, status.activeTimeLeft <= 0);
                    }
                });
            },
            write(write) {
                this.super$write(write);
                const l = statusList.length;
                write.b(l);
                for (var i = 0; i < l; i++) {
                    var status = statusList[i];
                    write.f(status.reload);
                    write.bool(status.active);
                    write.f(status.activeTimeLeft);
                    write.f(status.numValue1);
                    write.f(status.numValue2);
                    write.f(status.numValue3);
                    write.f(status.numValue4);
                }
            },
            read(read) {
                this.super$read(read);
                const l = read.b()
                for (var i = 0; i < l; i++) {
                    if (i >= statusList.length) {
                        read.f();
                        read.bool();
                        read.f();

                        read.f();
                        read.f();
                        read.f();
                        read.f();
                    } else {
                        var status = statusList[i];
                        status.reload = read.f();
                        status.active = read.bool();
                        status.activeTimeLeft = read.f();
                        status.numValue1 = read.f();
                        status.numValue2 = read.f();
                        status.numValue3 = read.f();
                        status.numValue4 = read.f();
                    }
                }
            },
            classId() { return classId; },
            isSkilled() { return statusList.length > 0; },
            tryActiveSkill(skillName, data) {
                for (var status of statusList) {
                    if (status.active && status.def.exclusive) {
                        return;
                    }
                }
                const skill = skillStatusMap[skillName];
                if (skill && skill.reload >= skill.def.cooldown) {
                    Call_ActiveSkill(this, skillName, data);
                    this.activeSkill(skillName, data, false);
                }
            },
            activeSkill(skillName, data, fromRemote) {
                for (var status of statusList) {
                    if (status.active && status.def.exclusive) {
                        return;
                    }
                }
                const skill = skillStatusMap[skillName];
                skill.def.active(skill, this, data);
                skill.reload = 0;
                if (skill.def.activeTime > 0) {
                    skill.activeTimeLeft = skill.def.activeTime;
                    skill.active = true;
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
