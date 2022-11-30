package dimensionshard.libs.skill;

import arc.ApplicationCore;
import arc.ApplicationListener;
import arc.Core;
import arc.Events;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.TextureRegion;
import arc.input.KeyCode;
import arc.scene.Group;
import arc.scene.style.TextureRegionDrawable;
import arc.scene.ui.ImageButton;
import arc.scene.ui.layout.Table;
import arc.struct.Seq;
import arc.util.Tmp;
import dimensionshard.libs.Lib;
import mindustry.ClientLauncher;
import mindustry.Vars;
import mindustry.core.GameState;
import mindustry.game.EventType;
import mindustry.gen.Tex;
import mindustry.gen.Unit;
import mindustry.input.Binding;
import mindustry.ui.Styles;

/**
 * 界面
 *
 * @author abomb4 2022-11-29 22:50:32
 */
public class SkillFragment {
    public static Color unfinish = new Color(0, 0, 0, 0.3F);
    public static Color finish = new Color(0, 0, 0, 0.8F);
    public static Color disabledColor = new Color(1, 1, 1, 0.4F);

    protected int selectSkill = -1;

    protected Seq<SkillStatus> skillList;

    protected ApplicationListener listener;

    protected Seq<TextureRegion> fIcons = new Seq<>();

    protected Table toggler;

    protected int marginBottom = 0;

    public void activeSkill(int index) {
        if (index < 0) {
            index = this.selectSkill;
        }
        final SkillStatus skill = skillList.get(index);
        if (skill != null) {
            final Unit unit = Vars.player.unit();
            if (unit instanceof SkilledUnit su) {
                su.tryActiveSkill(skill.def.getSkillId(), new DirectiveSkillData(
                    Core.input.mouseWorldX(),
                    Core.input.mouseWorldY()
                ));
            }
        }
        selectSkill = -1;
    }

    public void trySelectSkill(int index) {
        if (skillList != null && skillList.size > index) {
            final SkillStatus skill = skillList.get(index);
            if (skill.reload >= skill.def.cooldown) {
                if (skill.def.directive) {
                    selectSkill = selectSkill == index ? -1 : index;
                } else {
                    // activate
                    selectSkill = index;
                    activeSkill(index);
                }
                rebuild();
            }
        }
    }

    /**
     * 判断没有点到其他界面
     *
     * @return 没点到
     */
    public boolean notClickedAtOtherFrag() {
        return Core.scene.hit(Core.input.mouseX(), Core.input.mouseY(), true) == null;
    }

    /**
     * 是否为有键盘的环境
     *
     * @return 是否有键盘
     */
    public boolean haveKeyboard() {
        return !Vars.mobile;
    }

    /**
     * ?
     */
    public void rebuild() {
        final int zindex = toggler.getZIndex();
        final Group group = toggler.parent;
        toggler.remove();
        this.build(group);
        toggler.setZIndex(zindex);
    }

    public void build(Group parent) {
        parent.fill(full -> {
            this.toggler = full;
            full.center().left().marginBottom(marginBottom).visibility =
                () -> Vars.state.isGame() && Vars.ui.hudfrag.shown && skillList != null;
            if (skillList != null) {
                int index = -1;
                for (SkillStatus skill : skillList) {
                    index += 1;
                    var imageStyle = new ImageButton.ImageButtonStyle();
                    imageStyle.down = Styles.flatDown;
                    imageStyle.up = Styles.black;
                    imageStyle.over = Styles.flatOver;
                    imageStyle.imageDisabledColor = disabledColor;
                    imageStyle.imageUpColor = Color.white;
                    imageStyle.disabled = Styles.black3;
                    imageStyle.checked = Styles.flatDown;

                    var disabled = new TextureRegionDrawable() {
                        @Override
                        public void draw(float x, float y, float width, float height) {
                            var cooldownProgress = skill.reload / skill.def.cooldown;
                            // draw top
                            var cooldownProgressNega = (1 - cooldownProgress);
                            Draw.color(Tmp.c1.set(unfinish).toFloatBits());
                            Draw.rect(this.region, x + width / 2.0F, y + height - height * cooldownProgressNega / 2,
                                width, height * cooldownProgressNega);

                            // draw bottom
                            Draw.color(Tmp.c1.set(finish).toFloatBits());
                            Draw.rect(this.region, x + width / 2.0F, y + height * cooldownProgress / 2, width,
                                height * cooldownProgress);

                            // Maybe draw a seconds left?
                        }
                    };
                    disabled.setRegion(((TextureRegionDrawable) Tex.whiteui).getRegion());
                    imageStyle.disabled = disabled;

                    int finalIndex = index;
                    var skillButton = new ImageButton(skill.def.icon, imageStyle) {
                        @Override
                        public void draw() {
                            super.draw();
                            var width = 16;
                            var height = 16;
                            Draw.color(new Color(1, 1, 1, 0.6F));
                            if (haveKeyboard()) {
                                Draw.rect(fIcons.get(finalIndex), this.x + 4 + width / 2.0F,
                                    this.y + this.getHeight() - 4 - height / 2, width, height);
                            }
                        }
                    };

                    skillButton.changed(() -> {
                        trySelectSkill(finalIndex);
                        rebuild();
                    });
                    full.add(skillButton).update(v -> {
                        v.setChecked(selectSkill == finalIndex);
                        v.setDisabled(() -> {
                            if (skill.reload < skill.def.cooldown) {
                                return true;
                            }
                            var exclusive = false;
                            for (var s : skillList) {
                                if (s.active && s.def.exclusive) {
                                    exclusive = true;
                                    break;
                                }
                            }
                            return exclusive;
                        });
                    }).width(80).height(80);
                    full.row();
                }
            }
        });
    }

    /**
     * 加载
     */
    public void load() {

        if (Vars.headless) {
            return;
        }

        listener = new ApplicationCore() {
            @Override
            public void setup() {
            }

            @Override
            public void update() {
                if (Vars.state.getState() == GameState.State.playing && skillList != null) {
                    if (selectSkill >= 0 && Core.input.keyTap(Binding.select) && notClickedAtOtherFrag()) {
                        activeSkill(-1);
                        rebuild();
                    } else if (Core.input.keyTap(Binding.deselect)) {
                        selectSkill = -1;
                        rebuild();
                    } else if (haveKeyboard()) {
                        if (Core.input.keyTap(KeyCode.f1)) {
                            trySelectSkill(0);
                        } else if (Core.input.keyTap(KeyCode.f2)) {
                            trySelectSkill(1);
                        } else if (Core.input.keyTap(KeyCode.f3)) {
                            trySelectSkill(2);
                        } else if (Core.input.keyTap(KeyCode.f4)) {
                            trySelectSkill(3);
                        }
                    }
                }
            }
        };
        Events.on(EventType.ClientLoadEvent.class, (event -> {
            final ClientLauncher platform = (ClientLauncher) Vars.platform;
            platform.add(listener);
            fIcons.add(Lib.loadRegion("f1"));
            fIcons.add(Lib.loadRegion("f2"));
            fIcons.add(Lib.loadRegion("f3"));
            fIcons.add(Lib.loadRegion("f4"));
        }));

        Events.on(EventType.ClientLoadEvent.class, (event -> {
            build(Vars.ui.hudGroup);
        }));
        Events.on(EventType.WorldLoadEvent.class, (event -> {
            Core.app.post((this::rebuild));
        }));
        Events.on(EventType.UnitChangeEvent.class, (event -> {
            // Build fragments by unit
            if (!Vars.headless && Vars.player != null && Vars.player.unit() == event.unit) {
                if (event.unit instanceof SkilledUnit unit) {
                    unit.initSkill();
                    skillList = unit.getSkillList();
                } else {
                    skillList = null;
                }
                rebuild();
            }
        }));
    }
}
