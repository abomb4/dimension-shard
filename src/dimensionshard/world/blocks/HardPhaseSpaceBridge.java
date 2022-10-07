package dimensionshard.world.blocks;

import dimensionshard.libs.LiquidUtils;
import mindustry.gen.Building;
import mindustry.type.Liquid;

/**
 * 不会自燃的相位空间桥
 *
 * @author abomb4 2022-10-07
 */
public class HardPhaseSpaceBridge extends PhaseSpaceBridge {

    public HardPhaseSpaceBridge(String name) {
        super(name);
    }

    /** Instance */
    public class HardPhaseSpaceBridgeBuild extends PhaseSpaceBridgeBuild {

        @Override
        public float moveLiquid(Building next, Liquid liquid) {
            return LiquidUtils.moveLiquidWithoutFire(this, next, liquid);
        }
    }
}
