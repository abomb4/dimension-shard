package dimensionshard;

import arc.Events;
import arc.scene.style.TextureRegionDrawable;
import arc.struct.Seq;
import mindustry.content.Blocks;
import mindustry.content.Items;
import mindustry.content.Planets;
import mindustry.content.SectorPresets;
import mindustry.content.SerpuloTechTree;
import mindustry.content.TechTree;
import mindustry.ctype.UnlockableContent;
import mindustry.game.EventType;
import mindustry.game.Objectives;
import mindustry.type.ItemStack;

import static dimensionshard.DsBlocks.*;
import static dimensionshard.DsSectorPresets.darkGuard;
import static dimensionshard.DsSectorPresets.dimensionFall;
import static dimensionshard.DsSectorPresets.dimensionOutpost;
import static dimensionshard.DsSectorPresets.dimensionShackles;
import static dimensionshard.DsSectorPresets.hardStuff;
import static dimensionshard.DsSectorPresets.theBerserker;
import static dimensionshard.DsSectorPresets.thunderLightning;
import static dimensionshard.DsSectorPresets.timeRiver;
import static dimensionshard.DsSectorPresets.whiteFlame;
import static dimensionshard.DsUnits.beat;
import static dimensionshard.DsUnits.burn;
import static dimensionshard.DsUnits.collapse;
import static dimensionshard.DsUnits.equa;
import static dimensionshard.DsUnits.formula;
import static dimensionshard.DsUnits.rhapsody;

/**
 * @author abomb4 2022-12-27 08:29:39
 */
public class DsTechTree {

    /**
     * 加入现有科技树
     *
     * @param content      内容
     * @param parent       爹
     * @param requirements 物品需求
     * @param objectives   目标
     */
    public static void addToTree(UnlockableContent content, UnlockableContent parent,
                                 ItemStack[] requirements,
                                 Seq<Objectives.Objective> objectives) {
        TechTree.all.each(t -> t.content == content, TechTree.TechNode::remove);

        // find parent node
        TechTree.all.each(t -> t.content == parent, parentNode -> {
            final TechTree.TechNode node = new TechTree.TechNode(null, content,
                requirements == null ? content.researchRequirements() : requirements);

            if (objectives != null) {
                node.objectives.addAll(objectives);
            }

            if (node.parent != null) {
                node.parent.children.remove(node);
            }

            if (!parentNode.children.contains(node)) {
                parentNode.children.add(node);
            }
            node.parent = parentNode;
        });
    }

    /**
     * 加入现有科技树
     *
     * @param content      内容
     * @param parent       爹
     * @param requirements 物品需求
     */
    public static void addToTree(UnlockableContent content, UnlockableContent parent,
                                 ItemStack[] requirements) {
        addToTree(content, parent, requirements, null);
    }

    /**
     * 加入现有科技树
     *
     * @param content 内容
     * @param parent  爹
     */
    public static void addToTree(UnlockableContent content, UnlockableContent parent) {
        addToTree(content, parent, null, null);
    }

    public static void load() {
        // clone serpulo tree
        final TechTree.TechNode tmp = Planets.serpulo.techTree;
        SerpuloTechTree.load();
        final TechTree.TechNode newTree = Planets.serpulo.techTree;
        Planets.serpulo.techTree = tmp;

        newTree.name = DsPlanets.wrek.name;
        newTree.planet = DsPlanets.wrek;
        newTree.planet.techTree = newTree;
        Events.on(EventType.ClientLoadEvent.class, ev ->
            newTree.icon = new TextureRegionDrawable(dimensionTechnologyCore5.uiIcon));

        // -=-=-=-=-=-=-=-=-=-=-=- No core needed -=-=-=-=-=-=-=-=-=-=-=-
        addToTree(phaseSpaceBridge, Blocks.phaseConveyor);
        addToTree(shardWall, Blocks.phaseWallLarge);
        addToTree(shardWallLarge, shardWall);
        addToTree(dimensionTechnologyCore5, Blocks.coreShard);
        addToTree(dimensionTechnologyCore6, dimensionTechnologyCore5);

        // -=-=-=-=-=-=-=-=-=-=-=- After core -=-=-=-=-=-=-=-=-=-=-=-
        // factory line
        addToTree(DsBlocks.shardReceiver, Blocks.phaseWeaver, ItemStack.with(
            Items.silicon, 200 * 30,
            Items.thorium, 320 * 30,
            Items.phaseFabric, 330 * 30,
            Items.surgeAlloy, 100 * 30
        ));
        addToTree(spaceCrystallizer, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.SectorComplete(dimensionFall)));
        addToTree(hardThoriumAlloySmelter, spaceCrystallizer, null, Seq.with(new Objectives.SectorComplete(hardStuff)));
        addToTree(timeCondenser, hardThoriumAlloySmelter, null, Seq.with(new Objectives.SectorComplete(timeRiver)));
        addToTree(timeCrystallizer, timeCondenser, null, Seq.with(new Objectives.SectorComplete(hardStuff)));
        addToTree(radioisotopeWeaver, hardThoriumAlloySmelter, null,
            Seq.with(new Objectives.SectorComplete(dimensionOutpost)));
        addToTree(ionCollector, timeCondenser, null, Seq.with(new Objectives.SectorComplete(whiteFlame)));
        addToTree(dimensionAlloySmelter, ionCollector, null,
            Seq.with(new Objectives.SectorComplete(dimensionShackles)));

        // distribution line
        addToTree(hardPhaseSpaceBridge, phaseSpaceBridge);
        addToTree(spaceUnloader, dimensionTechnologyCore5);
        addToTree(resourcesDispatchingCenter, spaceUnloader);

        // power line
        addToTree(dimensionCrystalBattery, dimensionTechnologyCore5);
        addToTree(timeCompressedRtg, dimensionCrystalBattery);

        // defence line
        addToTree(hardThoriumAlloyWall, dimensionTechnologyCore5);
        addToTree(hardThoriumAlloyWallLarge, hardThoriumAlloyWall);

        // liquid line
        addToTree(hardThoriumConduit, dimensionTechnologyCore5);
        addToTree(hardThoriumLiquidRouter, hardThoriumConduit);
        addToTree(spaceLiquidTank, hardThoriumLiquidRouter);
        addToTree(spacePump, hardThoriumLiquidRouter);

        // drill line
        addToTree(hardThoriumDrill, dimensionTechnologyCore5);

        // turret line
        addToTree(bombTeleporter, dimensionTechnologyCore5);
        addToTree(dc, bombTeleporter);
        addToTree(ionBoltTurret, bombTeleporter);
        addToTree(darkLightTurret, ionBoltTurret, null, Seq.with(new Objectives.SectorComplete(darkGuard)));
        addToTree(electricStormTurret, ionBoltTurret, null, Seq.with(new Objectives.SectorComplete(thunderLightning)));

        // effect line
        addToTree(deflectForceProjector, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.SectorComplete(dimensionOutpost)));
        addToTree(spaceVault, dimensionTechnologyCore5, null, Seq.with(new Objectives.SectorComplete(dimensionFall)));
        // addToTree(unitTeleporter, deflectForceProjector);
        addToTree(timeOverdrive, deflectForceProjector);

        // unit line
        addToTree(dimensionT4Reconstructor, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.SectorComplete(whiteFlame)));
        addToTree(dimensionT5Reconstructor, dimensionT4Reconstructor);

        addToTree(formula, dimensionT4Reconstructor);
        addToTree(equa, formula, null, Seq.with(new Objectives.Research(dimensionT5Reconstructor)));

        addToTree(burn, dimensionT4Reconstructor);
        addToTree(collapse, burn, null, Seq.with(new Objectives.Research(dimensionT5Reconstructor)));

        addToTree(beat, dimensionT4Reconstructor);
        addToTree(rhapsody, beat, null, Seq.with(
            new Objectives.Research(dimensionT5Reconstructor),
            new Objectives.SectorComplete(darkGuard),
            new Objectives.SectorComplete(thunderLightning)
        ));

        // zones
        addToTree(dimensionFall, SectorPresets.planetaryTerminal);
        addToTree(hardStuff, dimensionFall, null, Seq.with(new Objectives.SectorComplete(dimensionFall)));
        addToTree(dimensionOutpost, hardStuff, null, Seq.with(new Objectives.SectorComplete(hardStuff)));
        addToTree(timeRiver, hardStuff, null, Seq.with(new Objectives.SectorComplete(hardStuff)));
        addToTree(whiteFlame, timeRiver, null, Seq.with(new Objectives.SectorComplete(timeRiver)));
        addToTree(dimensionShackles, whiteFlame, null, Seq.with(new Objectives.SectorComplete(whiteFlame)));
        addToTree(darkGuard, dimensionShackles, null, Seq.with(new Objectives.SectorComplete(dimensionShackles)));
        addToTree(thunderLightning, dimensionShackles, null,
            Seq.with(new Objectives.SectorComplete(dimensionShackles)));
        addToTree(theBerserker, thunderLightning, null, Seq.with(new Objectives.Research(rhapsody)));

    }
}
