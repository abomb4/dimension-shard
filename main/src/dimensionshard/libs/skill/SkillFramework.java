package dimensionshard.libs.skill;

import arc.struct.ObjectMap;
import dimensionshard.libs.skill.units.SkilledLegsUnit;
import dimensionshard.libs.skill.units.SkilledMechUnit;
import dimensionshard.libs.skill.units.SkilledPayloadUnit;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import dimensionshard.libs.skill.units.SkilledUnitWaterMove;

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

    /** 界面 */
    public static SkillFragment skillFragment;

    /** load */
    public static void load() {
        SkilledUnitEntity.load();
        SkilledMechUnit.load();
        SkilledLegsUnit.load();
        SkilledUnitWaterMove.load();
        SkilledPayloadUnit.load();

        skillFragment = new SkillFragment();
        skillFragment.load();
    }
}
