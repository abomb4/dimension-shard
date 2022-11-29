package dimensionshard.libs.skill;

import arc.util.io.Writes;

/**
 * 挂在单位上的技能状态
 *
 * @author abomb4 2022-10-21
 */
public class SkillStatus {

    public transient SkillDefinition def;
    public float reload;
    public boolean active;
    public float activeTimeLeft;
    public float numValue1;
    public float numValue2;
    public float numValue3;
    public float numValue4;

    public SkillStatus(SkillDefinition skillDefinition) {
        this.def = skillDefinition;
        this.reload = 0;
        this.active = false;
        this.activeTimeLeft = 0;
    }

    public void write(Writes write) {
        write.f(this.reload);
        write.bool(this.active);
        write.f(this.activeTimeLeft);
        write.f(this.numValue1);
        write.f(this.numValue2);
        write.f(this.numValue3);
        write.f(this.numValue4);
    }

    public void setFrom(SkillStatus other) {
        this.reload = other.reload;
        this.active = other.active;
        this.activeTimeLeft = other.activeTimeLeft;
        this.numValue1 = other.numValue1;
        this.numValue2 = other.numValue2;
        this.numValue3 = other.numValue3;
        this.numValue4 = other.numValue4;
    }
}
