package dimensionshard.types.blocks.ds;

import dimensionshard.DsGlobal;
import dimensionshard.libs.Lib;
import mindustry.world.blocks.production.AttributeCrafter;

/**
 * 工厂太多了，弄一个这个减少代码行数
 *
 * @author abomb4 2022-10-20
 */
public class DsAttributeCrafter extends AttributeCrafter {

    public DsAttributeCrafter(String name) {
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

    public class DsAttributeCrafterBuild extends AttributeCrafterBuild {
    }
}
