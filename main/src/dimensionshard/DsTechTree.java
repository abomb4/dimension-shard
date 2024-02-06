package dimensionshard;

import arc.Events;
import arc.scene.style.TextureRegionDrawable;
import arc.struct.Seq;
import mindustry.content.Blocks;
import mindustry.content.Items;
import mindustry.content.Planets;
import mindustry.content.SerpuloTechTree;
import mindustry.content.TechTree;
import mindustry.ctype.UnlockableContent;
import mindustry.game.EventType;
import mindustry.game.Objectives;
import mindustry.type.ItemStack;
import mindustry.type.SectorPreset;

import java.util.Iterator;

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
    public static void addToTree(TechTree.TechNode tree,
                                 UnlockableContent content,
                                 UnlockableContent parent,
                                 ItemStack[] requirements,
                                 Seq<Objectives.Objective> objectives) {
        tree.each(t -> {
            if (t.content == content) {
                t.remove();
            }
        });

        // find parent node
        tree.each(t -> {
            if (t.content == parent) {
                final TechTree.TechNode node = new TechTree.TechNode(null, content,
                    requirements == null ? content.researchRequirements() : requirements);

                if (objectives != null) {
                    node.objectives.addAll(objectives);
                }

                if (node.parent != null) {
                    node.parent.children.remove(node);
                }

                if (!t.children.contains(node)) {
                    t.children.add(node);
                }
                node.parent = t;
            }
        });
    }

    /**
     * 加入现有科技树
     *
     * @param content      内容
     * @param parent       爹
     * @param requirements 物品需求
     */
    public static void addToTree(TechTree.TechNode tree, UnlockableContent content, UnlockableContent parent,
                                 ItemStack[] requirements) {
        addToTree(tree, content, parent, requirements, null);
    }

    /**
     * 加入现有科技树
     *
     * @param content 内容
     * @param parent  爹
     */
    public static void addToTree(TechTree.TechNode tree, UnlockableContent content, UnlockableContent parent) {
        addToTree(tree, content, parent, null, null);
    }

    public static void load() {
        // clone serpulo tree
        final TechTree.TechNode tmp = Planets.serpulo.techTree;
        SerpuloTechTree.load();
        final TechTree.TechNode newTree = Planets.serpulo.techTree;
        Planets.serpulo.techTree = tmp;

        DsPlanets.wrek.techTree = newTree;
        newTree.name = DsPlanets.wrek.name;
        newTree.planet = DsPlanets.wrek;
        newTree.planet.techTree = newTree;
        Events.on(EventType.ClientLoadEvent.class, ev ->
            newTree.icon = new TextureRegionDrawable(dimensionTechnologyCore5.uiIcon));

        // remove sectors node, remove sector objectives
        // try not to recursive
        Seq<Iterator<TechTree.TechNode>> stack = new Seq<>(true);
        stack.add(newTree.children.iterator());
        outer:
        while (!stack.isEmpty()) {
            Iterator<TechTree.TechNode> it = stack.peek();
            while (it.hasNext()) {
                TechTree.TechNode child = it.next();
                if (child.content instanceof SectorPreset) {
                    // remove sector node
                    it.remove();
                    continue;
                }
                Iterator<Objectives.Objective> objectiveIt = child.objectives.iterator();
                while (objectiveIt.hasNext()) {
                    Objectives.Objective objective = objectiveIt.next();
                    if (objective instanceof Objectives.SectorComplete) {
                        objectiveIt.remove();
                    }
                }
                if (child.children != null && !child.children.isEmpty()) {
                    stack.add(child.children.iterator());
                    continue outer;
                }
            }
            stack.pop();
        }

        // -=-=-=-=-=-=-=-=-=-=-=- No core needed -=-=-=-=-=-=-=-=-=-=-=-
        addToTree(newTree, phaseSpaceBridge, Blocks.phaseConveyor);
        addToTree(newTree, shardWall, Blocks.phaseWallLarge);
        addToTree(newTree, shardWallLarge, shardWall);
        addToTree(newTree, dimensionTechnologyCore5, Blocks.coreShard);
        addToTree(newTree, dimensionTechnologyCore6, dimensionTechnologyCore5);

        // -=-=-=-=-=-=-=-=-=-=-=- After core -=-=-=-=-=-=-=-=-=-=-=-
        // factory line
        addToTree(newTree, DsBlocks.shardReceiver, Blocks.phaseWeaver, ItemStack.with(
            Items.silicon, 200 * 30,
            Items.thorium, 320 * 30,
            Items.phaseFabric, 330 * 30,
            Items.surgeAlloy, 100 * 30
        ));
        addToTree(newTree, spaceCrystallizer, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.OnSector(dimensionFall)));
        addToTree(newTree, hardThoriumAlloySmelter, spaceCrystallizer, null,
            Seq.with(new Objectives.OnSector(hardStuff)));
        addToTree(newTree, timeCondenser, hardThoriumAlloySmelter, null, Seq.with(new Objectives.OnSector(timeRiver)));
        addToTree(newTree, timeCrystallizer, timeCondenser, null, Seq.with(new Objectives.OnSector(hardStuff)));
        addToTree(newTree, radioisotopeWeaver, hardThoriumAlloySmelter, null,
            Seq.with(new Objectives.OnSector(dimensionOutpost)));
        addToTree(newTree, ionCollector, timeCondenser, null, Seq.with(new Objectives.OnSector(whiteFlame)));
        addToTree(newTree, dimensionAlloySmelter, ionCollector, null,
            Seq.with(new Objectives.OnSector(dimensionShackles)));

        // distribution line
        addToTree(newTree, hardPhaseSpaceBridge, phaseSpaceBridge);
        addToTree(newTree, spaceUnloader, dimensionTechnologyCore5);
        addToTree(newTree, resourcesDispatchingCenter, spaceUnloader);

        // power line
        addToTree(newTree, dimensionCrystalBattery, dimensionTechnologyCore5);
        addToTree(newTree, timeCompressedRtg, dimensionCrystalBattery);
        addToTree(newTree, powerNetNode, timeCompressedRtg);
        addToTree(newTree, powerNetTower, powerNetNode);

        // defence line
        addToTree(newTree, hardThoriumAlloyWall, dimensionTechnologyCore5);
        addToTree(newTree, hardThoriumAlloyWallLarge, hardThoriumAlloyWall);

        // liquid line
        addToTree(newTree, hardThoriumConduit, dimensionTechnologyCore5);
        addToTree(newTree, hardThoriumLiquidRouter, hardThoriumConduit);
        addToTree(newTree, spaceLiquidTank, hardThoriumLiquidRouter);
        addToTree(newTree, spacePump, hardThoriumLiquidRouter);

        // drill line
        addToTree(newTree, hardThoriumDrill, dimensionTechnologyCore5);

        // turret line
        addToTree(newTree, bombTeleporter, dimensionTechnologyCore5);
        addToTree(newTree, dc, bombTeleporter);
        addToTree(newTree, ionBoltTurret, bombTeleporter);
        addToTree(newTree, darkLightTurret, ionBoltTurret, null, Seq.with(new Objectives.OnSector(darkGuard)));
        addToTree(newTree, electricStormTurret, ionBoltTurret, null,
            Seq.with(new Objectives.OnSector(thunderLightning)));

        // effect line
        addToTree(newTree, deflectForceProjector, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.OnSector(dimensionOutpost)));
        addToTree(newTree, spaceVault, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.OnSector(dimensionFall)));
        // addToTree(newTree, unitTeleporter, deflectForceProjector);
        addToTree(newTree, timeOverdrive, deflectForceProjector);

        // unit line
        addToTree(newTree, dimensionT4Reconstructor, dimensionTechnologyCore5, null,
            Seq.with(new Objectives.OnSector(whiteFlame)));
        addToTree(newTree, dimensionT5Reconstructor, dimensionT4Reconstructor);

        addToTree(newTree, formula, dimensionT4Reconstructor);
        addToTree(newTree, equa, formula, null, Seq.with(new Objectives.Research(dimensionT5Reconstructor)));

        addToTree(newTree, burn, dimensionT4Reconstructor);
        addToTree(newTree, collapse, burn, null, Seq.with(new Objectives.Research(dimensionT5Reconstructor)));

        addToTree(newTree, beat, dimensionT4Reconstructor);
        addToTree(newTree, rhapsody, beat, null, Seq.with(
            new Objectives.Research(dimensionT5Reconstructor),
            new Objectives.OnSector(darkGuard),
            new Objectives.OnSector(thunderLightning)
        ));

        // zones
        addToTree(newTree, dimensionFall, Blocks.coreShard);
        addToTree(newTree, hardStuff, dimensionFall, null, Seq.with(new Objectives.SectorComplete(dimensionFall)));
        addToTree(newTree, dimensionOutpost, hardStuff, null, Seq.with(new Objectives.SectorComplete(hardStuff)));
        addToTree(newTree, timeRiver, hardStuff, null, Seq.with(new Objectives.SectorComplete(hardStuff)));
        addToTree(newTree, whiteFlame, timeRiver, null, Seq.with(new Objectives.SectorComplete(timeRiver)));
        addToTree(newTree, dimensionShackles, whiteFlame, null, Seq.with(new Objectives.SectorComplete(whiteFlame)));
        addToTree(newTree, darkGuard, dimensionShackles, null,
            Seq.with(new Objectives.SectorComplete(dimensionShackles)));
        addToTree(newTree, thunderLightning, dimensionShackles, null,
            Seq.with(new Objectives.SectorComplete(dimensionShackles)));
        addToTree(newTree, theBerserker, thunderLightning, null, Seq.with(new Objectives.Research(rhapsody)));

    }
}
