package dimensionshard.libs.skill;

import dimensionshard.libs.Lib;
import mindustry.gen.Call;
import mindustry.gen.Unit;

/**
 * 网络通信
 *
 * @author abomb4 2022-10-20
 */
public class SkillCall {

    /** 包体类型，触发技能 */
    public static final String TYPE = Lib.modName + "-SfActiveSkill";

    /** 信息分隔符 */
    private static final String DELIMITER = "#";

    /**
     * 若当前触发者为服务器，则发送到所有客户端；若为客户端则发送给服务器
     *
     * @param unit    单位
     * @param skillId 技能 id
     * @param data    技能数据
     */
    public static void callActiveSkill(Unit unit, int skillId, SkillData data) {
        Call.clientPacketReliable(TYPE, skillId + DELIMITER + data.serializeToNetPack());
    }

    /**
     * load
     */
    public static void load() {

    }
}
