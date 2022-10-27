package dimensionshard.libs.skill;

import arc.struct.ObjectMap;

/**
 * Skill Framework.
 * <pre>
 * 1. Define skills at unit define place
 * 2. When play controlls the unit, show hud
 * 3. AI automatically use skills, by some logic
 * 4. save and load
 *
 * Skill can:
 * 1. modify unit properties like:
 * - speed
 * - weapon reload time
 * 2. When skill running:
 * - May disable moving
 * - May disable shooting
 * - May disable other skills
 * 3. Skills can do:
 * - Move units
 * - Create bullets
 * - affect nearby units
 * </pre>
 *
 * @author abomb4 2022-10-20
 */
public class SkillFramework {

    /** 共有多少个技能 */
    public ObjectMap<Integer, SkillDefinition> registry;
}
