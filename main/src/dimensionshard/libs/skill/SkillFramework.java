package dimensionshard.libs.skill;

import arc.struct.ObjectMap;
import dimensionshard.annotation.SkillFrameworkAnnotationProcessor;
import dimensionshard.libs.skill.units.SkilledLegsUnit;
import dimensionshard.libs.skill.units.SkilledMechUnit;
import dimensionshard.libs.skill.units.SkilledPayloadUnit;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import dimensionshard.libs.skill.units.SkilledUnitWaterMove;
import dimensionshard.libs.skill.units.SkilledUnits;

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
 * <p>
 * 技能框架的所有逻辑实现都放在了 {@link SkillFrameworkAnnotationProcessor} ，采用代码生成器的方式生成 UnitEntity 类。
 * <p>
 * 支持的单位类型定义在 {@link SkilledUnits} ，里面定义了 classId ；如果将来游戏更新后发生了冲突，应该修改这里。
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
        SkilledUnitEntity.loadStatic();
        SkilledMechUnit.loadStatic();
        SkilledLegsUnit.loadStatic();
        SkilledUnitWaterMove.loadStatic();
        SkilledPayloadUnit.loadStatic();

        skillFragment = new SkillFragment();
        skillFragment.load();
    }
}
