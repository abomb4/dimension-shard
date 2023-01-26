package dimensionshard.libs.skill;

import arc.util.Log;
import dimensionshard.libs.Lib;
import mindustry.Vars;
import mindustry.gen.Call;
import mindustry.gen.Groups;
import mindustry.gen.Unit;

/**
 * 网络通信
 *
 * @author abomb4 2022-10-20
 */
public class SkillCall {

    /** 包体类型，触发技能 */
    public static final String TYPE_ACTIVE = Lib.modName + "-SfActiveSkill";

    /** 包体类型，触发技能 */
    public static final String TYPE_ACTIVE_AGAIN = Lib.modName + "-SfActiveSkillAgain";

    /** 信息分隔符 */
    private static final String DELIMITER = SkillData.DELIMITER;

    /**
     * 若当前触发者为服务器，则发送到所有客户端；若为客户端则发送给服务器
     *
     * @param unit    单位
     * @param skillId 技能 id
     * @param data    技能数据
     */
    public static void callActiveSkill(Unit unit, int skillId, SkillData data) {
        Call.clientPacketReliable(TYPE_ACTIVE, unit.id + DELIMITER + skillId + DELIMITER + data.serializeToNetPack());
    }

    /**
     * 若当前触发者为服务器，则发送到所有客户端；若为客户端则发送给服务器
     *
     * @param unit    单位
     * @param skillId 技能 id
     * @param data    技能数据
     */
    public static void callActiveSkillAgain(Unit unit, int skillId, SkillData data) {
        Call.clientPacketReliable(TYPE_ACTIVE_AGAIN,
            unit.id + DELIMITER + skillId + DELIMITER + data.serializeToNetPack());
    }

    /**
     * load
     */
    public static void load() {
        // region TYPE_ACTIVE
        // Client receives skill active packet, deal self
        if (Vars.netClient != null) {
            Vars.netClient.addPacketHandler(TYPE_ACTIVE, pack -> {
                String[] split = pack.split(DELIMITER);
                if (split.length != 3) {
                    Log.warn("Skill framework pack '@' is invalid", pack);
                    return;
                }
                int id = Integer.parseInt(split[0]);
                int skillId = Integer.parseInt(split[1]);
                String dataPack = split[2];
                DirectiveSkillData data = DirectiveSkillData.deserialize(dataPack);
                Unit unit = Groups.unit.getByID(id);
                if (!(unit instanceof SkilledUnit sUnit)) {
                    Log.warn("Unit '@' is not skilled unit", unit);
                    return;
                }

                if (sUnit.getSkillList() != null) {
                    // Avoid twice active
                    if (Vars.player.unit() == sUnit) {
                        return;
                    }
                    sUnit.activeSkill(skillId, data, true);
                }
            });
        }

        // Server receives skill active packet, deal self and forward packet
        Vars.netServer.addPacketHandler(TYPE_ACTIVE, (player, pack) -> {
            String[] split = pack.split(DELIMITER);
            if (split.length != 3) {
                Log.warn("Skill framework pack '@' is invalid", pack);
                return;
            }
            int id = Integer.parseInt(split[0]);
            int skillId = Integer.parseInt(split[1]);
            String dataPack = split[2];
            DirectiveSkillData data = DirectiveSkillData.deserialize(dataPack);
            Unit unit = Groups.unit.getByID(id);
            if (!(unit instanceof SkilledUnit sUnit)) {
                Log.warn("Unit '@' is not skilled unit", unit);
                return;
            }

            if (sUnit.getSkillList() != null) {
                // Avoid twice active
                if (Vars.player.unit() == sUnit) {
                    return;
                }
                sUnit.activeSkill(skillId, data, true);
                // forward to every client
                Call.clientPacketReliable(TYPE_ACTIVE, pack);
            }
        });
        // endregion TYPE_ACTIVE

        // region TYPE_ACTIVE_AGAIN
        // Client receives skill active packet, deal self
        if (Vars.netClient != null) {
            Vars.netClient.addPacketHandler(TYPE_ACTIVE_AGAIN, pack -> {
                String[] split = pack.split(DELIMITER);
                if (split.length != 3) {
                    Log.warn("Skill framework pack '@' is invalid", pack);
                    return;
                }
                int id = Integer.parseInt(split[0]);
                int skillId = Integer.parseInt(split[1]);
                String dataPack = split[2];
                DirectiveSkillData data = DirectiveSkillData.deserialize(dataPack);
                Unit unit = Groups.unit.getByID(id);
                if (!(unit instanceof SkilledUnit sUnit)) {
                    Log.warn("Unit '@' is not skilled unit", unit);
                    return;
                }

                if (sUnit.getSkillList() != null) {
                    // Avoid twice active
                    if (Vars.player.unit() == sUnit) {
                        return;
                    }
                    sUnit.activeSkillAgain(skillId, data, true);
                }
            });
        }

        // Server receives skill active packet, deal self and forward packet
        Vars.netServer.addPacketHandler(TYPE_ACTIVE_AGAIN, (player, pack) -> {
            String[] split = pack.split(DELIMITER);
            if (split.length != 3) {
                Log.warn("Skill framework pack '@' is invalid", pack);
                return;
            }
            int id = Integer.parseInt(split[0]);
            int skillId = Integer.parseInt(split[1]);
            String dataPack = split[2];
            DirectiveSkillData data = DirectiveSkillData.deserialize(dataPack);
            Unit unit = Groups.unit.getByID(id);
            if (!(unit instanceof SkilledUnit sUnit)) {
                Log.warn("Unit '@' is not skilled unit", unit);
                return;
            }

            if (sUnit.getSkillList() != null) {
                // Avoid twice active
                if (Vars.player.unit() == sUnit) {
                    return;
                }
                sUnit.activeSkillAgain(skillId, data, true);
                // forward to every client
                Call.clientPacketReliable(TYPE_ACTIVE_AGAIN, pack);
            }
        });
        // endregion TYPE_ACTIVE_AGAIN
    }
}
