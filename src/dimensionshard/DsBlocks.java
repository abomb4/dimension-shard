package dimensionshard;

import dimensionshard.libs.Lib;
import dimensionshard.libs.LiquidUtils;
import dimensionshard.world.blocks.ArmoredWall;
import dimensionshard.world.blocks.HardPhaseSpaceBridge;
import dimensionshard.world.blocks.IonBoltTurret;
import dimensionshard.world.blocks.PhaseSpaceBridge;
import mindustry.content.Blocks;
import mindustry.content.Items;
import mindustry.gen.Building;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.type.Liquid;
import mindustry.world.Block;
import mindustry.world.blocks.defense.Wall;
import mindustry.world.blocks.liquid.ArmoredConduit;
import mindustry.world.blocks.liquid.LiquidRouter;
import mindustry.world.blocks.production.Pump;
import mindustry.world.meta.BuildVisibility;

/**
 * bu lao ke si
 *
 * @author abomb4 2022-10-07
 */
@SuppressWarnings({"UnqualifiedMethodAccess", "UnqualifiedFieldAccess"})
public final class DsBlocks {

    // @formatter:off

    public static Block
        // region Dimension Shard technology

        // turrets
        ionBoltTurret,

        // distributions
        phaseSpaceBridge, hardPhaseSpaceBridge,

        // liquids
        hardThoriumConduit, hardThoriumLiquidRouter, spaceLiquidTank, spacePump,

        // Defence
        shardWall, shardWallLarge, hardThoriumAlloyWall, hardThoriumAlloyWallLarge

        // endregion Dimension Shard technology
    ;

    // @formatter:on

    public static void load() {
        // region Dimension Shard technology

        // region Turrets
        ionBoltTurret = new IonBoltTurret("ion-bolt-turret");

        // endregion Turrets

        // region Distribution

        phaseSpaceBridge = new PhaseSpaceBridge("phase-space-bridge") {{
            // buildVisibility = BuildVisibility.shown;
            // category = Category.distribution;
            size = 1;
            health = 220;
            hasItems = true;
            hasLiquids = true;
            outputsLiquid = true;
            itemCapacity = 25;
            liquidCapacity = 20;
            liquidPressure = 1.2F;
            range = 15;
            transportTime = 0.01F;
            requirements(Category.distribution, ItemStack.with(
                Items.metaglass, 15,
                Items.silicon, 5,
                Items.titanium, 8,
                Items.phaseFabric, 15,
                DsItems.dimensionShard, 20
            ));
            consumePower(0.5F);
        }};

        hardPhaseSpaceBridge = new HardPhaseSpaceBridge("hard-phase-space-bridge") {{
            size = 1;
            health = 450;
            hasItems = true;
            hasLiquids = true;
            outputsLiquid = true;
            itemCapacity = 40;
            liquidCapacity = 80;
            liquidPressure = 1.3F;
            range = 18;
            transportTime = 0.01F;
            requirements(Category.distribution, ItemStack.with(
                Items.metaglass, 20,
                Items.silicon, 8,
                Items.plastanium, 10,
                Items.phaseFabric, 20,
                DsItems.dimensionShard, 30,
                DsItems.hardThoriumAlloy, 30
            ));
            consumePower(0.8F);
        }};
        // endregion Distribution

        // region Liquid
        hardThoriumConduit = new ArmoredConduit("hard-thorium-conduit") {
            {
                buildVisibility = BuildVisibility.shown;
                size = 1;
                health = 300;
                liquidCapacity = 24;
                liquidPressure = 1.05F;
                requirements(Category.liquid, ItemStack.with(
                    Items.metaglass, 4,
                    Items.plastanium, 2,
                    DsItems.hardThoriumAlloy, 2
                ));
                this.buildType = () -> new ArmoredConduit.ArmoredConduitBuild() {

                    @Override
                    public float moveLiquid(Building next, Liquid liquid) {
                        return LiquidUtils.moveLiquidWithoutFire(this, next, liquid);
                    }
                };
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
        };

        hardThoriumLiquidRouter = new LiquidRouter("hard-thorium-liquid-router") {
            {
                buildVisibility = BuildVisibility.shown;
                size = 1;
                health = 300;
                liquidCapacity = 30;
                requirements(Category.liquid, ItemStack.with(
                    Items.graphite, 12,
                    Items.metaglass, 6,
                    Items.plastanium, 3,
                    DsItems.hardThoriumAlloy, 3
                ));
                this.buildType = () -> new LiquidRouter.LiquidRouterBuild() {

                    @Override
                    public float moveLiquid(Building next, Liquid liquid) {
                        return LiquidUtils.moveLiquidWithoutFire(this, next, liquid);
                    }
                };
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
        };

        spaceLiquidTank = new LiquidRouter("space-liquid-tank") {
            {
                buildVisibility = BuildVisibility.shown;
                size = 3;
                health = 1400;
                liquidCapacity = Blocks.liquidTank.liquidCapacity * 5;
                requirements(Category.liquid, ItemStack.with(
                    Items.metaglass, 150,
                    Items.plastanium, 75,
                    DsItems.spaceCrystal, 30,
                    DsItems.hardThoriumAlloy, 50
                ));
                this.buildType = () -> new LiquidRouter.LiquidRouterBuild() {

                    @Override
                    public float moveLiquid(Building next, Liquid liquid) {
                        return LiquidUtils.moveLiquidWithoutFire(this, next, liquid);
                    }
                };
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
        };

        spacePump = new Pump("space-pump") {
            {
                size = 3;
                health = 500;
                liquidCapacity = Blocks.impulsePump.liquidCapacity * 2;
                pumpAmount = 0.3F;
                consumePower(2.8F);
                hasPower = true;
                requirements(Category.liquid, ItemStack.with(
                    Items.copper, 100,
                    Items.metaglass, 120,
                    Items.plastanium, 45,
                    DsItems.spaceCrystal, 60,
                    DsItems.hardThoriumAlloy, 50
                ));
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
        };
        // endregion Liquid

        // region Defence
        shardWall = new Wall("shard-phase-wall") {{
            size = 1;
            health = (int) (Blocks.phaseWall.health * (9 / 8F));
            buildCostMultiplier = 6.6F;
            flashHit = true;
            chanceDeflect = ((Wall) Blocks.phaseWall).chanceDeflect * 1.2F;
            requirements(Category.defense, ItemStack.with(
                Items.phaseFabric, 4,
                DsItems.dimensionShard, 2
            ));
        }};

        shardWallLarge = new Wall("shard-phase-wall-large") {{
            size = 2;
            health = shardWall.health * 4;
            requirements = ItemStack.mult(shardWall.requirements, 4);
            buildVisibility = shardWall.buildVisibility;
            category = shardWall.category;
            buildCostMultiplier = shardWall.buildCostMultiplier;
            flashHit = ((Wall) shardWall).flashHit;
            chanceDeflect = ((Wall) shardWall).chanceDeflect;
            requirements(Category.defense, ItemStack.mult(shardWall.requirements, 4));
        }};

        hardThoriumAlloyWall = new ArmoredWall("hard-thorium-alloy-wall") {
            {
                armor = 5;
                size = 1;
                health = 950;
                requirements = ItemStack.with(DsItems.hardThoriumAlloy, 6);
                buildVisibility = BuildVisibility.shown;
                category = Category.defense;
                buildCostMultiplier = 6;
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
        };

        hardThoriumAlloyWallLarge = new ArmoredWall("hard-thorium-alloy-wall-large") {
            {
                armor = 7;
                size = 2;
                health = hardThoriumAlloyWall.health * 4;
                requirements = ItemStack.mult(hardThoriumAlloyWall.requirements, 4);
                buildVisibility = hardThoriumAlloyWall.buildVisibility;
                category = hardThoriumAlloyWall.category;
                buildCostMultiplier = hardThoriumAlloyWall.buildCostMultiplier;
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
        };
        // endregion Defence

        // endregion Dimension Shard technology
    }
}
