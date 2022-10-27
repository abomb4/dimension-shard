package dimensionshard.libs.skill.units;

import dimensionshard.annotation.GenerateSkilledUnit;
import mindustry.gen.LegsUnit;
import mindustry.gen.MechUnit;
import mindustry.gen.PayloadUnit;
import mindustry.gen.UnitEntity;
import mindustry.gen.UnitWaterMove;

/**
 * 单位列表
 *
 * @author abomb4 2022-10-28 00:50:17
 */
public interface SkilledUnits {

    /** 一般单位 */
    @GenerateSkilledUnit(baseUnit = UnitEntity.class, classId = 50)
    interface SkilledUnitEntityc {
    }

    /** 类似 dagger 的机甲单位扩展 */
    @GenerateSkilledUnit(baseUnit = MechUnit.class, classId = 51)
    interface SkilledMechUnitc {
    }

    /** 腿腿单位 */
    @GenerateSkilledUnit(baseUnit = LegsUnit.class, classId = 52)
    interface SkilledLegsUnitc {
    }

    /** 水单位 */
    @GenerateSkilledUnit(baseUnit = UnitWaterMove.class, classId = 53)
    interface SkilledUnitWaterMovec {
    }

    /** ?单位 */
    @GenerateSkilledUnit(baseUnit = PayloadUnit.class, classId = 54)
    interface SkilledPayloadUnitc {
    }
}
