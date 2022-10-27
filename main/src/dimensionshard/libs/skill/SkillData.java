package dimensionshard.libs.skill;

/**
 * 技能定制数据
 *
 * @author abomb4 2022-10-21
 */
public interface SkillData {

    /** 分隔符 */
    String DELIMITER = "#";

    /**
     * 序列化为网络包，多个值请使用 {@link #DELIMITER} 做分隔
     */
    String serializeToNetPack();


}
