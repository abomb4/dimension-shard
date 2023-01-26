package dimensionshard.libs.skill;

/**
 * 指向性技能
 *
 * @author abomb4 2022-11-23 11:29:20
 */
public class DirectiveSkillData implements SkillData {

    /** x */
    public float x;
    /** y */
    public float y;

    /**
     * Construct by x y
     *
     * @param x x
     * @param y y
     */
    public DirectiveSkillData(float x, float y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public String serializeToNetPack() {
        return x + DELIMITER + y;
    }

    /**
     * 解析一段 data 为对象，如果解析失败则返回 null
     *
     * @param data 序列化对象
     * @return 数据
     */
    public static DirectiveSkillData deserialize(String data) {

        String[] split = data.split(DELIMITER);
        if (split.length != 2) {
            return null;
        }
        float x = Float.parseFloat(split[0]);
        float y = Float.parseFloat(split[1]);
        return new DirectiveSkillData(x, y);
    }
}
