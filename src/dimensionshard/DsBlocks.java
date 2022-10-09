package dimensionshard;

import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Lines;
import arc.math.Mathf;
import dimensionshard.entities.bullets.DirectLightning;
import dimensionshard.libs.Lib;
import dimensionshard.libs.LiquidUtils;
import dimensionshard.world.blocks.ArmoredWall;
import dimensionshard.world.blocks.ElectricStormTurret;
import dimensionshard.world.blocks.HardPhaseSpaceBridge;
import dimensionshard.world.blocks.IonBoltTurret;
import dimensionshard.world.blocks.PhaseSpaceBridge;
import mindustry.content.Blocks;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.content.StatusEffects;
import mindustry.entities.Effect;
import mindustry.entities.bullet.LightningBulletType;
import mindustry.entities.bullet.PointBulletType;
import mindustry.entities.pattern.ShootSpread;
import mindustry.gen.Building;
import mindustry.gen.Bullet;
import mindustry.gen.Sounds;
import mindustry.graphics.Drawf;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.type.Liquid;
import mindustry.world.blocks.defense.Wall;
import mindustry.world.blocks.defense.turrets.ItemTurret;
import mindustry.world.blocks.defense.turrets.PowerTurret;
import mindustry.world.blocks.defense.turrets.Turret;
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

    // region Dimension Shard technology

    // turrets
    public static IonBoltTurret ionBoltTurret;
    public static Turret bombTeleporter;
    public static Turret dc;
    public static ElectricStormTurret electricStormTurret;

    // distributions
    public static PhaseSpaceBridge phaseSpaceBridge;
    public static HardPhaseSpaceBridge hardPhaseSpaceBridge;

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

    // endregion Dimension Shard technology
    ;

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
                    DsItems.spaceCrystal, 30
                );
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
                        speed = turretRange;
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
                        speed = turretRange;
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
                        speed = turretRange;
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
                        speed = turretRange;
                        hitShake = 2;
                        reflectable = false;
                        absorbable = false;
                    }},
                    DsItems.dimensionShard, new PointBulletType() {{
                        shootEffect = Fx.none;
                        hitEffect = DsFx.fxDimensionShardExplosion;
                        smokeEffect = Fx.none;
                        trailEffect = Fx.none;
                        despawnEffect = DsFx.fxDimensionShardExplosion;
                        hitSound = Sounds.explosion;
                        damage = 0;
                        splashDamageRadius = 38;
                        splashDamage = 70;
                        speed = turretRange;
                        hitShake = 1.6F;
                        reflectable = false;
                        absorbable = false;
                    }},
                    DsItems.spaceCrystal, new PointBulletType() {
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
                            speed = turretRange;
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
                range = 165;
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
                    DsItems.spaceCrystal, 60,
                    DsItems.hardThoriumAlloy, 30
                );
                shootType = new LightningBulletType() {
                    {
                        damage = 22;
                        lightningLength = 24;
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
