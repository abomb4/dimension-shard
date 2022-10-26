package dimensionshard;

import arc.Core;
import arc.graphics.Blending;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Lines;
import arc.graphics.g2d.TextureRegion;
import arc.math.Angles;
import arc.math.Mathf;
import arc.struct.EnumSet;
import arc.util.Strings;
import dimensionshard.libs.Lib;
import dimensionshard.libs.LiquidUtils;
import dimensionshard.types.blocks.ArmoredWall;
import dimensionshard.types.blocks.DarkLightTurret;
import dimensionshard.types.blocks.DeflectForceProjector;
import dimensionshard.types.blocks.ElectricStormTurret;
import dimensionshard.types.blocks.HardPhaseSpaceBridge;
import dimensionshard.types.blocks.IonBoltTurret;
import dimensionshard.types.blocks.PhaseSpaceBridge;
import dimensionshard.types.blocks.ds.DsAttributeCrafter;
import dimensionshard.types.blocks.ds.DsGenericCrafter;
import dimensionshard.types.bullets.DirectLightning;
import mindustry.Vars;
import mindustry.content.Blocks;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.content.Liquids;
import mindustry.content.StatusEffects;
import mindustry.entities.Effect;
import mindustry.entities.bullet.LightningBulletType;
import mindustry.entities.bullet.PointBulletType;
import mindustry.entities.pattern.ShootSpread;
import mindustry.gen.Building;
import mindustry.gen.Bullet;
import mindustry.gen.Sounds;
import mindustry.graphics.Drawf;
import mindustry.graphics.Layer;
import mindustry.graphics.Pal;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.type.Liquid;
import mindustry.type.LiquidStack;
import mindustry.ui.Bar;
import mindustry.world.Block;
import mindustry.world.blocks.defense.OverdriveProjector;
import mindustry.world.blocks.defense.Wall;
import mindustry.world.blocks.defense.turrets.ItemTurret;
import mindustry.world.blocks.defense.turrets.PowerTurret;
import mindustry.world.blocks.defense.turrets.Turret;
import mindustry.world.blocks.liquid.ArmoredConduit;
import mindustry.world.blocks.liquid.LiquidRouter;
import mindustry.world.blocks.power.Battery;
import mindustry.world.blocks.power.ConsumeGenerator;
import mindustry.world.blocks.production.Drill;
import mindustry.world.blocks.production.GenericCrafter;
import mindustry.world.blocks.production.Pump;
import mindustry.world.blocks.storage.CoreBlock;
import mindustry.world.blocks.storage.StorageBlock;
import mindustry.world.blocks.units.UnitFactory;
import mindustry.world.consumers.ConsumeItemRadioactive;
import mindustry.world.draw.DrawDefault;
import mindustry.world.draw.DrawFlame;
import mindustry.world.draw.DrawMulti;
import mindustry.world.draw.DrawWarmupRegion;
import mindustry.world.meta.Attribute;
import mindustry.world.meta.BlockFlag;
import mindustry.world.meta.BuildVisibility;

import static dimensionshard.DsItems.dimensionAlloy;
import static dimensionshard.DsItems.dimensionShard;
import static dimensionshard.DsItems.hardThoriumAlloy;
import static dimensionshard.DsItems.ionLiquid;
import static dimensionshard.DsItems.spaceCrystal;
import static dimensionshard.DsItems.timeCrystal;
import static dimensionshard.DsItems.timeFlow;

/**
 * bu lao ke si
 *
 * @author abomb4 2022-10-07
 */
@SuppressWarnings({"UnqualifiedMethodAccess", "UnqualifiedFieldAccess"})
public final class DsBlocks {

    // region Common technology

    // public static CoreConstructionPlatform coreConstructionPlatform;

    // endregion Common technology

    // region Dimension Shard technology

    // turrets
    public static IonBoltTurret ionBoltTurret;
    public static Turret bombTeleporter;
    public static Turret dc;
    public static ElectricStormTurret electricStormTurret;
    public static DarkLightTurret darkLightTurret;

    // distributions
    public static PhaseSpaceBridge phaseSpaceBridge;
    public static HardPhaseSpaceBridge hardPhaseSpaceBridge;
    // public static ResourcesDispatchingCenter resourcesDispatchingCenter;
    // public static SpaceUnloader spaceUnloader;

    // liquids
    public static ArmoredConduit hardThoriumConduit;
    public static LiquidRouter hardThoriumLiquidRouter;
    public static LiquidRouter spaceLiquidTank;
    public static Pump spacePump;

    // Defence
    public static Wall shardWall;
    public static Wall shardWallLarge;
    public static ArmoredWall hardThoriumAlloyWall;
    public static ArmoredWall hardThoriumAlloyWallLarge;

    // Drill
    public static Drill hardThoriumDrill;

    // Power
    public static Battery dimensionCrystalBattery;
    public static ConsumeGenerator timeCompressedRtg;

    // Factory
    public static GenericCrafter shardReceiver;
    public static GenericCrafter spaceCrystallizer;
    public static GenericCrafter hardThoriumAlloySmelter;
    public static GenericCrafter timeCondenser;
    public static GenericCrafter timeCrystallizer;
    public static GenericCrafter radioisotopeWeaver;
    public static GenericCrafter ionCollector;
    public static GenericCrafter dimensionAlloySmelter;

    // Unit
    public static UnitFactory dimensionT4Reconstructor;
    public static UnitFactory dimensionT5Reconstructor;
    // public static UnitTeleporter unitTeleporter;

    // Effect
    public static CoreBlock dimensionTechnologyCore3;
    public static CoreBlock dimensionTechnologyCore;
    public static DeflectForceProjector deflectForceProjector;
    public static StorageBlock spaceVault;
    public static OverdriveProjector timeOverdrive;

    // endregion Dimension Shard technology

    public static void load() {
        // region Dimension Shard technology

        // region Turrets
        ionBoltTurret = new IonBoltTurret("ion-bolt-turret");

        bombTeleporter = new ItemTurret("bomb-teleporter") {
            final Color teleportColor = Color.valueOf("69dcee");
            final Effect fxTeleporterShoot = new Effect(16, 24, e -> {
                Draw.color(teleportColor);
                for (var i = 0; i < 4; i++) {
                    Drawf.tri(e.x, e.y, 4, 24 * e.fout(), i * 90 + e.id * 10);
                }

                Lines.stroke(Math.max(0, e.fout() - 0.5F) * 2.5F);
                Lines.circle(e.x, e.y, 24 * e.finpow());

                Draw.color();
                for (var i = 0; i < 4; i++) {
                    Drawf.tri(e.x, e.y, 2, 12 * e.fout(), i * 90 + e.id * 10);
                }
            });

            {
                final int turretRange = 220;
                cooldownTime = 0.04F;
                recoil = 1.5F;
                liquidCapacity = 10;
                buildVisibility = BuildVisibility.shown;
                category = Category.turret;
                health = 1800;
                size = 3;
                reload = 45 - 1;
                range = turretRange;
                rotateSpeed = 10;
                inaccuracy = 2;
                xRand = 0;
                shootEffect = fxTeleporterShoot;
                shootSound = Lib.loadSound("bomb-teleport");
                heatColor = teleportColor;
                requirements = ItemStack.with(
                    Items.copper, 200,
                    Items.silicon, 130,
                    Items.thorium, 110,
                    spaceCrystal, 30
                );
                coolant = consumeCoolant(0.3f);
                this.consumePower(1F);

                ammo(
                    Items.coal, new PointBulletType() {{
                        shootEffect = Fx.none;
                        hitEffect = Fx.explosion;
                        smokeEffect = Fx.none;
                        trailEffect = Fx.none;
                        despawnEffect = Fx.explosion;
                        hitSound = Sounds.explosion;
                        damage = 0;
                        splashDamageRadius = 30;
                        splashDamage = 30;
                        makeFire = true;
                        status = StatusEffects.burning;
                        statusDuration = 120;
                        speed = 999999999F;
                        hitShake = 1;
                        reflectable = false;
                        absorbable = false;
                    }},
                    Items.sporePod, new PointBulletType() {{
                        shootEffect = Fx.none;
                        hitEffect = Fx.explosion;
                        smokeEffect = Fx.none;
                        trailEffect = Fx.none;
                        despawnEffect = Fx.explosion;
                        hitSound = Sounds.explosion;
                        damage = 0;
                        splashDamageRadius = 24;
                        splashDamage = 10;
                        makeFire = true;
                        status = StatusEffects.burning;
                        statusDuration = 150;
                        speed = 999999999F;
                        hitShake = 1.1F;
                        reflectable = false;
                        absorbable = false;
                    }},
                    Items.pyratite, new PointBulletType() {{
                        shootEffect = Fx.none;
                        hitEffect = Fx.blastExplosion;
                        smokeEffect = Fx.smokeCloud;
                        trailEffect = Fx.none;
                        despawnEffect = Fx.blastExplosion;
                        hitSound = Sounds.explosion;
                        damage = 0;
                        splashDamageRadius = 32;
                        splashDamage = 50;
                        makeFire = true;
                        status = StatusEffects.burning;
                        statusDuration = 240;
                        speed = 999999999F;
                        hitShake = 1.5F;
                        reflectable = false;
                        absorbable = false;
                    }},
                    Items.blastCompound, new PointBulletType() {{
                        shootEffect = Fx.none;
                        hitEffect = Fx.massiveExplosion;
                        smokeEffect = Fx.none;
                        trailEffect = Fx.none;
                        despawnEffect = Fx.massiveExplosion;
                        hitSound = Sounds.explosion;
                        damage = 0;
                        splashDamageRadius = 45;
                        splashDamage = 105;
                        status = StatusEffects.blasted;
                        speed = 999999999F;
                        hitShake = 2;
                        reflectable = false;
                        absorbable = false;
                    }},
                    dimensionShard, new PointBulletType() {{
                        shootEffect = Fx.none;
                        hitEffect = DsFx.fxDimensionShardExplosion;
                        smokeEffect = Fx.none;
                        trailEffect = Fx.none;
                        despawnEffect = DsFx.fxDimensionShardExplosion;
                        hitSound = Sounds.explosion;
                        damage = 0;
                        splashDamageRadius = 38;
                        splashDamage = 70;
                        speed = 999999999F;
                        hitShake = 1.6F;
                        reflectable = false;
                        absorbable = false;
                    }},
                    spaceCrystal, new PointBulletType() {
                        {
                            shootEffect = Fx.none;
                            hitEffect = DsFx.fxBlackHoleExplode;
                            smokeEffect = Fx.none;
                            trailEffect = Fx.none;
                            despawnEffect = DsFx.fxBlackHoleExplode;
                            hitSound = Sounds.explosion;
                            damage = 0;
                            splashDamageRadius = 80;
                            splashDamage = 15;
                            speed = 999999999F;
                            hitShake = 2;
                            knockback = -0.55F;
                            reloadMultiplier = 0.6F;
                            ammoMultiplier = 1;
                            reflectable = false;
                            absorbable = false;
                        }

                        @Override
                        public void hit(Bullet b, float x, float y) {
                            super.hit(b, x, y);
                            DsBullets.blackHole.create(b, x, y, 0);
                        }
                    }
                );
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

        dc = new PowerTurret("dc") {
            {
                cooldownTime = 0.04F;
                recoil = 1;
                liquidCapacity = 10;
                buildVisibility = BuildVisibility.shown;
                category = Category.turret;
                health = 1700;
                size = 3;
                reload = 50 - 1;
                range = 170;
                inaccuracy = 0;
                shoot = new ShootSpread(4, 1);
                shoot.shots = 4;
                shootEffect = Fx.lightningShoot;
                heatColor = Color.red;
                rotateSpeed = 10;
                xRand = 6;
                shootSound = Sounds.spark;
                loopSound = Sounds.none;
                requirements = ItemStack.with(
                    Items.lead, 320,
                    Items.silicon, 80,
                    Items.plastanium, 120,
                    spaceCrystal, 60,
                    hardThoriumAlloy, 30
                );
                consumePower(10F);
                coolant = consumeCoolant(0.3f);
                shootType = new LightningBulletType() {
                    {
                        damage = 25;
                        lightningLength = 26;
                        lightningLengthRand = 12;
                        lightningColor = Color.valueOf("69dcee");
                    }

                    @Override
                    public void init(Bullet b) {
                        DirectLightning.createDirectLightning(b,
                            b.team,
                            this.lightningColor,
                            this.damage,
                            b.x, b.y,
                            b.rotation(),
                            this.lightningLength + Mathf.random(this.lightningLengthRand));
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
        electricStormTurret = new ElectricStormTurret("electric-storm-turret");
        darkLightTurret = new DarkLightTurret("dark-light");

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
                dimensionShard, 20
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
                dimensionShard, 30,
                hardThoriumAlloy, 30
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
                    hardThoriumAlloy, 2
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
                    hardThoriumAlloy, 3
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
                    spaceCrystal, 30,
                    hardThoriumAlloy, 50
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
                    spaceCrystal, 60,
                    hardThoriumAlloy, 50
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
                dimensionShard, 2
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
                health = 900;
                requirements = ItemStack.with(hardThoriumAlloy, 6);
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

        // region Drill

        hardThoriumDrill = new Drill("hard-thorium-drill") {
            {
                buildVisibility = BuildVisibility.shown;
                size = 4;
                health = 800;
                liquidCapacity = 300;
                requirements = ItemStack.with(
                    Items.copper, 200,
                    Items.graphite, 140,
                    Items.titanium, 100,
                    hardThoriumAlloy, 120,
                    DsItems.timeCrystal, 50
                );
                category = Category.production;

                drillTime = 100;
                drawRim = true;
                drawMineItem = true;
                hasPower = true;
                canOverdrive = false;
                tier = 9;
                updateEffect = Fx.pulverizeRed;
                updateEffectChance = 0.01F;
                drillEffect = Fx.mine;
                rotateSpeed = 4;
                warmupSpeed = 0.01F;
                heatColor = Color.valueOf("9a48ff");
                hardnessDrillMultiplier = 25;
                liquidBoostIntensity = 3;
                consumePower(8F);
                consumeLiquid(Liquids.water, 2F).boost();
            }

            /** 光圈 */
            public TextureRegion rotatorLightRegion;
            /** 色 */
            @SuppressWarnings("FieldMayBeFinal")
            public Color lightColor = Color.valueOf("9a48ff");

            @Override
            public void load() {
                super.load();
                rotatorLightRegion = Lib.loadRegion("hard-thorium-drill-rotator-light");
                rotatorRegion = Lib.loadRegion("hard-thorium-drill-rotator");
            }

            @Override
            public void setBars() {
                super.setBars();

                removeBar("drillspeed");
                addBar("drillspeed", (DrillBuild e) -> new Bar(() ->
                    Core.bundle.format("bar.drillspeed", Strings.fixed(e.lastDrillSpeed * 60, 2)),
                    () -> Pal.ammo,
                    () -> e.warmup
                ));
            }

            {
                this.buildType = () -> new DrillBuild() {
                    /** 圈圈 */
                    public float lightup = 0F;

                    @Override
                    public void updateTile() {
                        if (timer(timerDump, dumpTime)) {
                            dump(dominantItem != null && items.has(dominantItem) ? dominantItem : null);
                        }

                        if (dominantItem == null) {
                            return;
                        }

                        timeDrilled += warmup * delta();

                        float delay = getDrillTime(dominantItem);

                        if (items.total() < itemCapacity && dominantItems > 0 && efficiency > 0) {
                            float speed = Mathf.lerp(1f, liquidBoostIntensity, optionalEfficiency) * efficiency;

                            lastDrillSpeed = (speed * dominantItems * warmup) / delay;
                            warmup = Mathf.approachDelta(warmup, speed, warmupSpeed);
                            progress += delta() * dominantItems * speed * warmup;

                            if (Mathf.chanceDelta(updateEffectChance * warmup)) {
                                updateEffect.at(x + Mathf.range(size * 2f), y + Mathf.range(size * 2f));
                            }

                            // purple light
                            if (this.optionalEfficiency > 0) {
                                this.lightup = Mathf.lerpDelta(this.lightup, 1, warmupSpeed);
                            } else {
                                this.lightup = Mathf.lerpDelta(this.lightup, 0, warmupSpeed);
                            }
                        } else {
                            lastDrillSpeed = 0f;
                            warmup = Mathf.approachDelta(warmup, 0f, warmupSpeed);
                            return;
                        }

                        if (dominantItems > 0 && progress >= delay && items.total() < itemCapacity) {
                            offload(dominantItem);

                            progress %= delay;

                            if (wasVisible) {
                                drillEffect.at(x + Mathf.range(drillEffectRnd), y + Mathf.range(drillEffectRnd),
                                    dominantItem.color);
                            }
                        }
                    }

                    @Override
                    public void draw() {
                        super.draw();

                        Draw.z(Layer.effect);
                        Draw.color(lightColor);
                        Draw.alpha(this.lightup * 0.9F);
                        Draw.rect(rotatorLightRegion, this.x, this.y, this.timeDrilled * rotateSpeed);
                        Draw.reset();
                    }
                };
            }

        };

        // endregion Drill

        // region Power
        dimensionCrystalBattery = new Battery("dimension-crystal-battery") {
            {
                buildVisibility = BuildVisibility.shown;
                size = 1;
                requirements = ItemStack.with(
                    Items.lead, 120,
                    Items.silicon, 60,
                    Items.titanium, 60,
                    spaceCrystal, 80,
                    DsItems.timeCrystal, 10
                );
                category = Category.power;
                health = 180;
                final float largeBatteryCapacity = Blocks.batteryLarge.consPower.capacity;
                consumePowerBuffered(largeBatteryCapacity * 3);
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

        timeCompressedRtg = new ConsumeGenerator("time-compressed-rtg") {{
            final int rtgMultipler = 12;
            final int rtgItemMultipler = 10;
            requirements(Category.power, ItemStack.with(
                Items.lead, 100 * rtgItemMultipler,
                Items.silicon, 75 * rtgItemMultipler,
                Items.phaseFabric, 25 * rtgItemMultipler,
                Items.plastanium, 75 * rtgItemMultipler,
                dimensionShard, 50 * rtgItemMultipler / 2,
                spaceCrystal, 120,
                DsItems.timeCrystal, 180,
                hardThoriumAlloy, 50 * rtgItemMultipler / 2
            ));
            size = 3;
            canOverdrive = false;
            powerProduction = ((ConsumeGenerator) Blocks.rtgGenerator).powerProduction * rtgMultipler;
            itemDuration = ((ConsumeGenerator) Blocks.rtgGenerator).itemDuration / (rtgMultipler - 1);
            drawer = new DrawMulti(new DrawDefault(), new DrawWarmupRegion() {{
                color = Color.valueOf("ffc4b7");
            }});

            consume(new ConsumeItemRadioactive());
        }};

        // endregion Power

        // region Factory

        shardReceiver = new GenericCrafter("shard-receiver") {
            {

                size = 4;
                // health = 600;
                requirements = ItemStack.with(
                    Items.metaglass, 160,
                    Items.silicon, 60,
                    Items.thorium, 120,
                    Items.phaseFabric, 150,
                    Items.surgeAlloy, 30
                );
                buildVisibility = BuildVisibility.shown;
                category = Category.crafting;

                craftEffect = Fx.smeltsmoke;
                outputItem = new ItemStack(dimensionShard, 1);
                craftTime = 300;
                hasPower = true;
                itemCapacity = 10;
                consumePower(7);
                drawer = new DrawMulti(new DrawDefault(), new DrawFlame(DsColors.dimensionShardColor));
            }

            @Override
            public void setBars() {
                super.setBars();
                addBar("progress",
                    (GenericCrafter.GenericCrafterBuild e) -> new Bar("bar.progress", DsColors.dimensionShardColor,
                        e::progress));
            }
        };

        spaceCrystallizer = new DsGenericCrafter("space-crystallizer") {{
            size = 2;
            outputItem = new ItemStack(spaceCrystal, 2);
            craftTime = 90;
            hasPower = true;
            itemCapacity = 20;
            // boostScale = 0.15;
            drawer = new DrawMulti(new DrawDefault(), new DrawFlame(Color.valueOf("00000000")));
            requirements(Category.crafting, ItemStack.with(
                Items.lead, 120,
                Items.silicon, 40,
                Items.thorium, 80,
                Items.phaseFabric, 30,
                dimensionShard, 70
            ));
            consumeItems(ItemStack.with(
                dimensionShard, 3,
                Items.silicon, 1,
                Items.phaseFabric, 1
            ));
            consumePower(2F);
        }};

        hardThoriumAlloySmelter = new DsGenericCrafter("hard-thorium-alloy-smelter") {{
            size = 3;
            craftEffect = Fx.smeltsmoke;
            outputItem = new ItemStack(hardThoriumAlloy, 2);
            craftTime = 90;
            hasPower = true;
            hasLiquids = false;
            drawer = new DrawMulti(new DrawDefault(), new DrawFlame(hardThoriumAlloy.color));
            itemCapacity = 20;
            requirements(Category.crafting, ItemStack.with(
                Items.copper, 120,
                Items.graphite, 40,
                Items.thorium, 160,
                dimensionShard, 110,
                spaceCrystal, 80
            ));
            consumeItems(ItemStack.with(
                spaceCrystal, 1,
                Items.graphite, 3,
                Items.thorium, 5
            ));
            consumePower(3);
        }};

        timeCondenser = new DsGenericCrafter("time-condenser") {{
            size = 2;
            hasPower = true;
            hasItems = true;
            hasLiquids = true;
            rotate = false;
            solid = true;
            outputsLiquid = true;
            drawer = new DrawDefault() {
                Color heatColor = timeFlow.color.cpy().lerp(Color.white, 0.5F);
                TextureRegion heatRegion;
                TextureRegion liquidRegion;
                TextureRegion rotatorRegion;
                TextureRegion bottomRegion;

                @Override
                public void load(Block block) {
                    super.load(block);
                    heatRegion = Lib.loadRegion("time-condenser-heat");
                    liquidRegion = Lib.loadRegion("time-condenser-liquid");
                    rotatorRegion = Lib.loadRegion("time-condenser-rotator");
                    bottomRegion = Lib.loadRegion("time-condenser-bottom");
                }

                @Override
                public void draw(Building build) {
                    GenericCrafter.GenericCrafterBuild entity = (GenericCrafterBuild) build;
                    Draw.rect(bottomRegion, entity.x, entity.y, 0);

                    Draw.color(Liquids.cryofluid.color);
                    Draw.alpha(entity.liquids.get(Liquids.cryofluid) / entity.block.liquidCapacity * 1);
                    Draw.rect(liquidRegion, entity.x, entity.y, 0);
                    Draw.color();

                    Draw.rect(rotatorRegion, entity.x, entity.y, entity.progress * 90);

                    Draw.rect(entity.block.region, entity.x, entity.y, 0);

                    Draw.color(heatColor);
                    Draw.alpha(entity.warmup * (0.7F + 0.3F * Mathf.sin(entity.progress * Mathf.PI * 2)));
                    Draw.blend(Blending.additive);
                    Draw.rect(heatRegion, entity.x, entity.y, 0);
                    Draw.blend();
                    Draw.reset();
                }
            };
            liquidCapacity = 24f;
            craftTime = 100;
            outputLiquid = new LiquidStack(timeFlow, 12F / 60F);

            consumePower(3f);
            consumeItems(ItemStack.with(
                dimensionShard, 4,
                Items.phaseFabric, 2
            ));
            consumeLiquid(Liquids.cryofluid, 6f / 60f);
            requirements(Category.crafting, ItemStack.with(
                Items.lead, 100,
                Items.silicon, 70,
                dimensionShard, 160,
                hardThoriumAlloy, 90
            ));
        }};

        timeCrystallizer = new DsAttributeCrafter("time-crystallizer") {{
            size = 3;
            attribute = Attribute.water;
            craftEffect = Fx.smeltsmoke;
            outputItem = new ItemStack(timeCrystal, 1);
            craftTime = 60;
            hasPower = true;
            drawer = new DrawDefault() {
                Color heatColor = timeCrystal.color.cpy().lerp(Color.white, 0.5F);
                TextureRegion heatRegion;
                TextureRegion liquidRegion;
                TextureRegion topRegion;

                @Override
                public void load(Block block) {
                    super.load(block);
                    heatRegion = Lib.loadRegion("time-crystallizer-heat");
                    liquidRegion = Lib.loadRegion("time-crystallizer-liquid");
                    topRegion = Lib.loadRegion("time-crystallizer-top");
                }

                @Override
                public void draw(Building build) {
                    GenericCrafter.GenericCrafterBuild entity = (GenericCrafterBuild) build;
                    Draw.rect(entity.block.region, entity.x, entity.y, 0);

                    Draw.color(heatColor);
                    Draw.alpha(entity.warmup * (0.7F + 0.3F * Mathf.sin(entity.progress * Mathf.PI * 2F)));
                    Draw.blend(Blending.additive);
                    Draw.rect(heatRegion, entity.x, entity.y, 0);
                    Draw.blend();

                    Draw.color(timeFlow.color);
                    Draw.alpha(entity.liquids.get(timeFlow) / entity.block.liquidCapacity);
                    Draw.rect(liquidRegion, entity.x, entity.y, 0);

                    Draw.rect(topRegion, entity.x, entity.y, 0);
                }
            };
            itemCapacity = 20;
            boostScale = 0.2F;

            consumeItems(ItemStack.with(Items.plastanium, 2));
            consumePower(2.5F);
            consumeLiquid(timeFlow, 0.1F);
            requirements(Category.crafting, ItemStack.with(
                Items.titanium, 120,
                Items.phaseFabric, 100,
                Items.surgeAlloy, 20,
                dimensionShard, 160,
                spaceCrystal, 80
            ));
        }};

        radioisotopeWeaver = new DsGenericCrafter("radioisotope-weaver") {{
            size = 3;
            craftEffect = Fx.smeltsmoke;
            outputItem = new ItemStack(Items.phaseFabric, 2);
            craftTime = 80;
            hasPower = true;
            itemCapacity = 50;
            ambientSound = Sounds.techloop;
            ambientSoundVolume = 0.02F;
            consumeItems(ItemStack.with(
                dimensionShard, 6,
                Items.sand, 18
            ));
            consumePower(18F);
            requirements(Category.crafting, ItemStack.with(
                Items.silicon, 180,
                dimensionShard, 70,
                spaceCrystal, 80,
                hardThoriumAlloy, 160
            ));
            drawer = new DrawDefault() {
                TextureRegion regionHeat1;
                TextureRegion regionHeat2;
                TextureRegion regionHeat3;
                TextureRegion regionWeaver;
                TextureRegion regionTop;

                @Override
                public void load(Block block) {
                    super.load(block);
                    regionHeat1 = Lib.loadRegion("radioisotope-weaver-heat1");
                    regionHeat2 = Lib.loadRegion("radioisotope-weaver-heat2");
                    regionHeat3 = Lib.loadRegion("radioisotope-weaver-heat3");
                    regionWeaver = Lib.loadRegion("radioisotope-weaver-weaver");
                    regionTop = Lib.loadRegion("radioisotope-weaver-top");
                }

                @Override
                public void draw(Building build) {
                    GenericCrafter.GenericCrafterBuild entity = (GenericCrafterBuild) build;
                    var lightWave = (0.7F + 0.3F * Mathf.sin(entity.totalProgress % 90 / 90 * Mathf.PI * 2));
                    var color = dimensionShard.color;
                    var colorLight = color.cpy().lerp(Color.white, 0.3F);
                    Draw.rect(entity.block.region, entity.x, entity.y, 0);

                    Draw.color(colorLight);
                    Draw.alpha(entity.warmup * lightWave);
                    Draw.blend(Blending.additive);
                    Draw.rect(regionHeat1, entity.x, entity.y, 0);
                    Draw.blend();
                    Draw.color();

                    Draw.rect(regionWeaver, entity.x, entity.y, entity.totalProgress);

                    Draw.color(color);
                    Draw.alpha(entity.warmup * lightWave);
                    Draw.blend(Blending.additive);
                    Draw.rect(regionHeat2, entity.x, entity.y, entity.totalProgress);
                    Draw.blend();
                    Draw.color();

                    Draw.color(Pal.accent);
                    Draw.alpha(entity.warmup * 0.8F);
                    var dst = Mathf.sin(entity.totalProgress, 6, Vars.tilesize * entity.block.size / 6F);
                    var rot = entity.totalProgress + 90;
                    Lines.lineAngleCenter(
                        entity.x + Angles.trnsx(rot, dst),
                        entity.y + Angles.trnsy(rot, dst),
                        rot + 90,
                        entity.block.size * Vars.tilesize / 3F
                    );
                    Draw.reset();

                    Draw.rect(regionTop, entity.x, entity.y, 0);

                    Draw.color(colorLight);
                    Draw.alpha(entity.warmup * lightWave);
                    Draw.blend(Blending.additive);
                    Draw.rect(regionHeat3, entity.x, entity.y, 0);
                    Draw.blend();
                    Draw.reset();
                }
            };
        }};

        ionCollector = new DsGenericCrafter("ion-collector") {{
            size = 3;
            hasPower = true;
            hasItems = true;
            hasLiquids = true;
            rotate = false;
            solid = true;
            outputsLiquid = true;
            drawer = new DrawDefault() {
                TextureRegion heatRegion;
                TextureRegion liquidRegion;
                TextureRegion liquidInRegion;

                @Override
                public void load(Block block) {
                    super.load(block);
                    heatRegion = Lib.loadRegion("ion-collector-heat");
                    liquidRegion = Lib.loadRegion("ion-collector-liquid");
                    liquidInRegion = Lib.loadRegion("ion-collector-liquid-in");
                }

                @Override
                public void draw(Building build) {
                    GenericCrafter.GenericCrafterBuild entity = (GenericCrafterBuild) build;
                    Draw.rect(entity.block.region, entity.x, entity.y, 0);

                    Draw.color(spaceCrystal.color);
                    Draw.alpha(Mathf.sin(entity.progress * Mathf.PI * 2));
                    Draw.blend(Blending.additive);
                    Draw.rect(heatRegion, entity.x, entity.y, 0);
                    Draw.blend();

                    Draw.color(outputLiquid.liquid.color);
                    Draw.alpha(entity.liquids.get(outputLiquid.liquid) / entity.block.liquidCapacity);
                    Draw.rect(liquidRegion, entity.x, entity.y, 0);

                    Draw.color(timeFlow.color);
                    Draw.alpha(entity.liquids.get(timeFlow) / entity.block.liquidCapacity);
                    Draw.rect(liquidInRegion, entity.x, entity.y, 0);
                }
            };
            liquidCapacity = 24f;
            craftTime = 90;
            outputLiquid = new LiquidStack(ionLiquid, 12F / 60F);

            consumePower(7f);
            consumeItems(ItemStack.with(
                Items.surgeAlloy, 1
            ));
            consumeLiquid(timeFlow, 6f / 60f);
            requirements(Category.crafting, ItemStack.with(
                Items.lead, 300,
                Items.plastanium, 100,
                Items.surgeAlloy, 50,
                dimensionShard, 60,
                timeCrystal, 30,
                hardThoriumAlloy, 180
            ));
        }};

        dimensionAlloySmelter = new DsGenericCrafter("dimension-alloy-smelter") {{
            size = 4;
            craftEffect = Fx.smeltsmoke;
            outputItem = new ItemStack(dimensionAlloy, 1);
            craftTime = 90;
            hasPower = true;
            itemCapacity = 20;

            requirements(Category.crafting, ItemStack.with(
                Items.copper, 300,
                Items.silicon, 220,
                Items.surgeAlloy, 80,
                spaceCrystal, 100,
                hardThoriumAlloy, 200,
                timeCrystal, 100
            ));
            consumeItems(ItemStack.with(
                spaceCrystal, 4,
                timeCrystal, 3,
                Items.surgeAlloy, 2
            ));
            consumeLiquid(ionLiquid, 0.1F);
            consumePower(8);
            drawer = new DrawMulti(new DrawDefault(), new DrawFlame(dimensionAlloy.color));
        }};
        // endregion Factory

        // region Effect
        dimensionTechnologyCore3 = new CoreBlock("dimension-technology-core-3") {{
            size = 5;
            health = 6000;
            itemCapacity = 14000;
            unitCapModifier = 22;
            researchCostMultiplier = 0.07F;
            // unitType = electron;
            requirements(Category.effect, ItemStack.with(
                Items.copper, 8000,
                Items.lead, 8000,
                Items.silicon, 5000,
                Items.thorium, 1000,
                dimensionShard, 3000
            ));
        }};

        dimensionTechnologyCore = new CoreBlock("dimension-technology-core") {{
            size = 6;
            health = 10000;
            itemCapacity = 24000;
            unitCapModifier = 34;
            researchCostMultiplier = 0.08F;
            // unitType = lightning;
            requirements(Category.effect, ItemStack.with(
                Items.copper, 15000,
                Items.lead, 15000,
                Items.silicon, 10000,
                Items.thorium, 8000,
                Items.phaseFabric, 3000,
                dimensionShard, 8000
            ));
        }};

        deflectForceProjector = new DeflectForceProjector("deflect-force-projector") {
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

        spaceVault = new StorageBlock("space-vault") {
            {
                size = 3;
                health = 600;
                itemCapacity = Blocks.vault.itemCapacity * 5;
                flags = EnumSet.of(BlockFlag.storage);
                requirements(Category.effect, ItemStack.with(
                    Items.titanium, 400,
                    Items.thorium, 30,
                    Items.phaseFabric, 80,
                    spaceCrystal, 140,
                    hardThoriumAlloy, 130
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

        timeOverdrive = new OverdriveProjector("time-overdrive") {
            {
                hasLiquids = true;
                liquidCapacity = 20;
                size = 3;
                range = 180;
                phaseRangeBoost = 40;
                speedBoost = 2.0F;
                speedBoostPhase = 2.0F;
                useTime = 180;
                hasBoost = true;
                consumePower(15);
                consumeLiquid(timeFlow, 0.1F).boost();
                requirements(Category.effect, ItemStack.with(
                    Items.lead, 400,
                    Items.silicon, 220,
                    Items.titanium, 240,
                    Items.plastanium, 150,
                    Items.surgeAlloy, 200,
                    timeCrystal, 150
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
        // endregion Effect

        // endregion Dimension Shard technology
    }
}
