package dimensionshard.libs.skill.units;

import arc.Events;
import arc.struct.ObjectMap;
import arc.struct.Seq;
import arc.util.Time;
import arc.util.io.Reads;
import arc.util.io.Writes;
import dimensionshard.libs.skill.SkillCall;
import dimensionshard.libs.skill.SkillData;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import mindustry.game.EventType;
import mindustry.gen.EntityMapping;
import mindustry.gen.Payloadc;
import mindustry.gen.Unit;
import mindustry.world.blocks.payloads.Payload;

public class Demo extends mindustry.gen.MechUnit implements SkilledUnit {

    public static boolean loaded = false;

    public static final int CLASS_ID = 121;

    public static void load() {
        if (!loaded) {
            Events.on(EventType.UnitDestroyEvent.class, e -> {
                final Unit unit = e.unit;
                if (unit instanceof SkilledUnit sku && unit.classId() == CLASS_ID) {
                    sku.clearSkillData();
                }
                if (unit instanceof Payloadc pu) {
                    for (Payload payload : pu.payloads()) {
                        if (payload instanceof SkilledUnit sku && sku.classId() == CLASS_ID) {
                            sku.clearSkillData();
                        }
                    }
                }
            });
            EntityMapping.idMap[CLASS_ID] = Demo::new;
            loaded = true;
        }
    }

    public transient boolean init;

    public ObjectMap<Integer, SkillStatus> skillStatusMap = new ObjectMap<>(4);
    public Seq<SkillStatus> statusList = new Seq<>(4);

    /**
     * 初始化技能数据
     */
    protected void initSkill() {
        if (this.init) {
            return;
        }
        if (this.type instanceof SkilledUnitType sku) {
            final Seq<SkillDefinition> definitions = sku.getSkillDefinitions();
            for (SkillDefinition definition : definitions) {
                SkillStatus skillStatus = new SkillStatus(definition);
                this.statusList.add(skillStatus);
                this.skillStatusMap.put(definition.getSkillId(), skillStatus);
            }
        }
        this.init = true;
    }

    @Override
    public int classId() {
        return CLASS_ID;
    }

    @Override
    public void clearSkillData() {
        this.skillStatusMap.clear();
        this.statusList.clear();
    }

    @Override
    public void add() {
        if (!this.init) {
            this.initSkill();
        }
        super.add();
    }

    @Override
    public void update() {
        if (this.statusList.isEmpty()) {
            super.update();
        } else {
            for (SkillStatus s : this.statusList) {
                if (s.reload >= s.def.cooldown) {
                    s.def.aiCheck(s, this);
                }
                if (s.active) {
                    s.activeTimeLeft -= Time.delta;
                    s.def.preUpdate(s, this, s.activeTimeLeft <= 0);
                }
            }

            super.update();
            for (SkillStatus s : this.statusList) {
                if (s.active) {
                    final boolean last = s.activeTimeLeft <= 0;
                    s.def.postUpdate(s, this, last);
                    s.active = !last;
                } else {
                    s.reload = Math.min(s.def.cooldown, s.reload + Time.delta);
                }
            }
        }
    }

    @Override
    public void damage(float amount, boolean withEffect) {
        for (SkillStatus status : this.statusList) {
            if (status.active) {
                amount = status.def.updateDamage(status, this, amount);
            }
        }
        super.damage(amount, withEffect);
    }

    @Override
    public float speed() {
        return super.speed() * this.speedMultiplier;
    }

    @Override
    public void draw() {
        super.draw();
        for (SkillStatus status : this.statusList) {
            if (status.active) {
                status.def.draw(status, this, status.activeTimeLeft <= 0);
            }
        }
    }

    @Override
    public void write(Writes write) {
        super.write(write);
        this.writeSkillStatuses(write);
    }

    @Override
    public void read(Reads read) {
        super.read(read);
        this.readSkillStatuses(read);
    }

    /**
     * 是否是技能单位
     *
     * @return 技能单位
     */
    public boolean isSkilled() {
        return this.statusList.size > 0;
    }

    public void tryActiveSkill(int skillId, SkillData data) {
        for (SkillStatus status : this.statusList) {
            if (status.active && status.def.exclusive) {
                return;
            }
        }
        final SkillStatus status = skillStatusMap.get(skillId);
        if (status != null && status.reload >= status.def.cooldown) {
            SkillCall.callActiveSkill(this, skillId, data);
            this.activeSkill(skillId, data, false);
        }
    }

    public void activeSkill(int skillId, SkillData data, boolean fromRemote) {
        for (SkillStatus status : this.statusList) {
            if (status.active && status.def.exclusive) {
                return;
            }
        }
        final SkillStatus status = skillStatusMap.get(skillId);
        status.def.active(status, this, data);
        status.reload = 0;
        if (status.def.activeTime > 0) {
            status.activeTimeLeft = status.def.activeTime;
            status.active = true;
        }
    }

    protected void writeSkillStatuses(Writes write) {
        if (this.type instanceof SkilledUnitType sku) {
            write.s(this.statusList.size);
            for (SkillStatus s : this.statusList) {
                s.write(write);
            }
        }
    }

    protected void readSkillStatuses(Reads read) {
        if (this.type instanceof SkilledUnitType sku) {
            final Seq<SkillDefinition> defs = sku.getSkillDefinitions();
            final short count = read.s();
            for (int i = 0; i < count; i++) {
                if (i >= defs.size) {
                    // 默认消化
                    read.f();
                    read.bool();
                    read.f();
                    read.f();
                    read.f();
                    read.f();
                    read.f();
                } else {
                    SkillStatus status = defs.get(i).readStatus(read);
                    this.statusList.add(status);
                    this.skillStatusMap.put(status.def.getSkillId(), status);
                }
            }
        }
    }
}
