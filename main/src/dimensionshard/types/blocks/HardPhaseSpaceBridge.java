package dimensionshard.types.blocks;

import dimensionshard.DsGlobal;
import dimensionshard.libs.Lib;
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

    @Override
    public boolean isPlaceable() {
        return DsGlobal.techDsAvailable() && super.isPlaceable();
    }

    @Override
    public void drawPlace(int x, int y, int rotation, boolean valid) {
        if (!DsGlobal.techDsAvailable()) {
            this.drawPlaceText(Lib.getMessage("msg", "dimensionCoreRequired"), x, y, valid);
            return;
        }
        super.drawPlace(x, y, rotation, valid);
    }

    /** Instance */
    public class HardPhaseSpaceBridgeBuild extends PhaseSpaceBridgeBuild {

        @Override
        public float moveLiquid(Building next, Liquid liquid) {
            return LiquidUtils.moveLiquidWithoutFire(this, next, liquid);
        }
    }
}
