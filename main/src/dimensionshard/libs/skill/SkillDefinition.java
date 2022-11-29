package dimensionshard.libs.skill;

import arc.func.Func;
import arc.graphics.g2d.TextureRegion;
import arc.util.io.Reads;

/**
 * 技能定义
 *
 * @author abomb4 2022-10-21
 */
public abstract class SkillDefinition {

    // * @property {string} name - Unique in one unit type, must not empty
    // * @property {number} cooldown - Not empty, you may need someNumber * 60.
    // * @property {TextureRegion} icon - Not empty, instance of TextureRegion, use lib.loadRegion
    // * @property {boolean} directivity - Should choose target.
    // * @property {boolean} exclusive - Usage for continously skill, if true, other skills cannot activate during
    // active time.
    // * @property {number} activeTime - If the skill is continously skill, set to greeter than zero
    // * @property {number} aiCheckInterval - Default is 20, like Turret#targetInterval
    // * @property {function(SkillStatus, Unit)} aiCheck - Not empty, AI function
    // * @property {function(SkillStatus, Unit, Data)} active - Not empty, active function
    // * @property {function(SkillStatus, Unit, boolean)} preUpdate - For continously skill; 3rd param is 'isLastFrame'
    // * @property {function(SkillStatus, Unit, boolean)} postUpdate - For continously skill; 3rd param is 'isLastFrame'
    // * @property {function(SkillStatus, Unit, boolean)} draw - For continously skill; 3rd param is 'isLastFrame'
    // * @property {function(SkillStatus, Unit, number): number} updateDamage - Update damage, return new damage
    // value; 3rd param is damage.

    /** 技能名称，应当使用纯 ascii ，推荐用小写 + 横线命名法，如 my-unit-boom */
    public String name;
    /** 影响范围 */
    public int range;
    /** 技能冷却时间 */
    public float cooldown;
    /** 技能图标 */
    public TextureRegion icon;
    /** 是否为指向性技能 */
    public boolean directive;
    /** 是否为排他性技能，适用于持续一段时间生效的技能，在技能持续时间内是否阻止其他技能的触发 */
    public boolean exclusive;
    /** 持续性技能持续时间 */
    public float activeTime;
    /** AI 运算检查间隔，避免太频繁占用性能 */
    public float aiCheckInterval;

    /** 技能状态构造器 */
    public Func<SkillDefinition, SkillStatus> skillStatusFunc = SkillStatus::new;

    public SkillDefinition(String name) {
        this.name = name;
    }

    /**
     * AI 运算检查，当单位非玩家控制时，用于判断技能触发时机
     *
     * @param status 技能状态
     * @param unit   技能单位
     */
    public void aiCheck(SkillStatus status, SkilledUnit unit) {

    }

    /**
     * 触发技能
     *
     * @param status 技能状态
     * @param unit   技能单位
     * @param data   技能触发数据，指向性技能有 x 与 y 做目标
     */
    public void active(SkillStatus status, SkilledUnit unit, Object data) {

    }

    /**
     * 持续性技能在单位 update 前执行的东西
     *
     * @param status      技能状态
     * @param unit        技能单位
     * @param isLastFrame 是否为技能持续最终帧
     */
    public void preUpdate(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {

    }

    /**
     * 持续性技能在单位 update 后执行的东西
     *
     * @param status      技能状态
     * @param unit        技能单位
     * @param isLastFrame 是否为最终帧
     */
    public void postUpdate(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {

    }

    /**
     * 绘画
     *
     * @param status      技能状态
     * @param unit        技能单位
     * @param isLastFrame 是否为最终帧
     */
    public void draw(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {

    }

    /**
     * 转换伤害，用于支持自身减伤或自身增伤的技能
     *
     * @param status 技能状态
     * @param unit   技能单位
     * @param damage 伤害值
     * @return 新的伤害值
     */
    public float updateDamage(SkillStatus status, SkilledUnit unit, float damage) {
        return damage;
    }

    /**
     * 获取技能 id
     *
     * @return 技能 id
     */
    public int getSkillId() {
        return this.name.hashCode();
    }

    /**
     * 读取技能状态
     *
     * @param read 读取
     * @return 技能状态
     */
    public SkillStatus readStatus(Reads read) {
        SkillStatus status = new SkillStatus(this);
        status.reload = read.f();
        status.active = read.bool();
        status.activeTimeLeft = read.f();
        status.numValue1 = read.f();
        status.numValue2 = read.f();
        status.numValue3 = read.f();
        status.numValue4 = read.f();
        return status;
    }
}
