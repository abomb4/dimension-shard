package dimensionshard;

import arc.util.Log;
import mindustry.mod.Mod;

public class DimensionShardMod extends Mod {

    public DimensionShardMod() {
        Log.info("Loaded DimensionShardV7Mod constructor.");
    }

    @Override
    public void loadContent() {
        Log.info("Loading some example content.");
        DsGlobal.mod = this;

        DsBullets.load();
        DsBlocks.load();
    }

}
