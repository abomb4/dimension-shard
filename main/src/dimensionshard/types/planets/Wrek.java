package dimensionshard.types.planets;

import arc.graphics.Color;
import dimensionshard.DsBlocks;
import dimensionshard.DsItems;
import mindustry.Vars;
import mindustry.content.Items;
import mindustry.content.Planets;
import mindustry.game.Team;
import mindustry.graphics.g3d.HexMesh;
import mindustry.graphics.g3d.HexSkyMesh;
import mindustry.graphics.g3d.MultiMesh;
import mindustry.maps.planet.SerpuloPlanetGenerator;
import mindustry.type.Planet;

/**
 * @author abomb4 2022-12-26 23:28:17
 */
public class Wrek extends Planet {

    public Wrek(Planet parent) {
        super("wrek", parent, 1, 2);

        generator = new SerpuloPlanetGenerator();
        meshLoader = () -> new HexMesh(this, 5);
        cloudMeshLoader = () -> new MultiMesh(
            new HexSkyMesh(this, 2, 0.15f, 0.14f, 5, Color.valueOf("68a7eb").a(0.75f), 2, 0.42f, 1f, 0.43f),
            new HexSkyMesh(this, 3, 0.6f, 0.15f, 5, Color.valueOf("93a2ee").a(0.75f), 2, 0.42f, 1.2f, 0.45f)
        );
        alwaysUnlocked = true;
        landCloudColor = Color.valueOf("4265ed");
        atmosphereColor = Color.valueOf("213159");
        atmosphereRadIn = 0.06f;
        atmosphereRadOut = 0.3f;
        orbitSpacing = 2f;
        totalRadius += 2.6f;
        lightSrcTo = 0.5f;
        lightDstFrom = 0.2f;
        clearSectorOnLose = false;
        defaultCore = DsBlocks.dimensionTechnologyCore5;
        iconColor = Color.valueOf("5a97cc");
        hiddenItems.addAll(Vars.content.items()).removeAll(Items.serpuloItems);
        hiddenItems.removeAll(DsItems.dimensionShardItems);

        tidalLock = true;
        updateLighting = false;

        ruleSetter = r -> {
            r.waveTeam = Team.crux;
            r.placeRangeCheck = false;
            r.showSpawns = true;
            r.fog = false;
            r.staticFog = true;
            r.lighting = false;
            r.coreDestroyClear = true;
            r.onlyDepositCore = true;
        };

        startSector = 15;
        unlockedOnLand.add(DsBlocks.dimensionTechnologyCore5);
        this.techTree = Planets.serpulo.techTree;
    }

    @Override
    public void init() {
        super.init();
    }
}
