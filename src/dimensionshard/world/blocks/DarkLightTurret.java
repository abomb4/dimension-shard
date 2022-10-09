package dimensionshard.world.blocks;

import dimensionshard.DsGlobal;
import dimensionshard.libs.Lib;
import mindustry.world.blocks.defense.turrets.PowerTurret;

/**
 * @author abomb4 2022-10-09
 */
public class DarkLightTurret extends PowerTurret {
    public DarkLightTurret(String name) {
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
}
