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
}
