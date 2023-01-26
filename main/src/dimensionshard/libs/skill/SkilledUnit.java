package dimensionshard.libs.skill;

import arc.struct.Seq;
import mindustry.gen.Unitc;

/**
 * 拥有技能的单位实例类
 *
 * @author abomb4 2022-10-21
 */
public interface SkilledUnit extends Unitc {

    /**
     * 清除技能数据，用于单位被移除时使用
     */
    void clearSkillData();

    /**
     * 单位实例类别，最大 255 ，不能与现有重复
     *
     * @return 类别
     */
    int classId();

    /**
     * 是否是技能单位
     *
     * @return 技能单位
     */
    boolean isSkilled();

    /**
     * 尝试触发技能
     *
     * @param skillId 技能 id
     * @param data    技能数据
     */
    void tryActiveSkill(int skillId, SkillData data);

    /**
     * 强制触发技能
     *
     * @param skillId    技能 id
     * @param data       技能数据
     * @param fromRemote 是否远程触发
     */
    void activeSkill(int skillId, SkillData data, boolean fromRemote);

    /**
     * 强制触发可重复触发的技能
     *
     * @param skillId    技能 id
     * @param data       技能数据
     * @param fromRemote 是否远程触发
     */
    void activeSkillAgain(int skillId, SkillData data, boolean fromRemote);

    /**
     * 获取所有技能列表
     *
     * @return 技能列表
     */
    Seq<SkillStatus> getSkillList();

    /**
     * 初始化技能数据
     */
    void initSkill();
}
