package dimensionshard;

import arc.util.Log;
import dimensionshard.libs.Changelog;
import dimensionshard.libs.skill.SkillFramework;
import mindustry.mod.Mod;

/**
 * Entrance
 */
public class DimensionShardMod extends Mod {

    @Override
    public void loadContent() {
        Log.info("Loading Dimension Shard mod.");
        DsGlobal.mod = this;

        DsShaders.load();
        DsOverride.load();

        DsBullets.load();
        SkillFramework.load();
        DsUnits.load();
        DsBlocks.load();

        DsPlanets.load();
        DsSectorPresets.load();
        DsTechTree.load();
        DsCall.initClientSide();
        Changelog.init();
    }

}
