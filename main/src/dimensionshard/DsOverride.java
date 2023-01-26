package dimensionshard;

import mindustry.content.Blocks;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.entities.bullet.ArtilleryBulletType;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.entities.bullet.FlakBulletType;
import mindustry.entities.bullet.LiquidBulletType;
import mindustry.entities.bullet.PointBulletType;
import mindustry.gen.Bullet;
import mindustry.world.blocks.defense.turrets.ItemTurret;
import mindustry.world.blocks.defense.turrets.LiquidTurret;

/**
 * 重写自带内容
 *
 * @author abomb4 2022-10-14
 */
public class DsOverride {

    /**
     * load overrides
     */
    @SuppressWarnings("UnqualifiedFieldAccess")
    public static void load() {

        // region Dimension Shard Ammo

        ((ItemTurret) Blocks.scatter).ammoTypes.put(
            DsItems.dimensionShard, new FlakBulletType(4.2F, 12F) {{
                lifetime = 70;
                ammoMultiplier = 2;
                shootEffect = Fx.shootSmall;
                width = 6;
                height = 8;
                hitEffect = DsFx.fxDimensionShardExplosion;
                splashDamage = 40;
                splashDamageRadius = 26;
                knockback = 0.6F;
                reloadMultiplier = 0.6F;
                frontColor = DsColors.dimensionShardColorLight;
                backColor = DsColors.dimensionShardColor;
            }}
        );

        ((ItemTurret) Blocks.cyclone).ammoTypes.put(
            DsItems.dimensionShard, new FlakBulletType(4.2F, 15F) {{
                lifetime = 60;
                ammoMultiplier = 3;
                shootEffect = Fx.shootSmall;
                width = 8;
                height = 10;
                hitEffect = DsFx.fxDimensionShardExplosion;
                splashDamage = 42;
                splashDamageRadius = 34;
                knockback = 0.6F;
                reloadMultiplier = 0.8F;
                frontColor = DsColors.dimensionShardColorLight;
                backColor = DsColors.dimensionShardColor;
                collidesGround = true;
            }}
        );

        ((ItemTurret) Blocks.ripple).ammoTypes.put(
            DsItems.dimensionShard, new ArtilleryBulletType(2, 20F) {{
                lifetime = 80;
                ammoMultiplier = 2;
                width = height = 13;
                hitEffect = DsFx.fxDimensionShardExplosion;
                splashDamage = 50;
                splashDamageRadius = 34;
                knockback = 2;
                reloadMultiplier = 0.8F;
                frontColor = DsColors.dimensionShardColorLight;
                backColor = DsColors.dimensionShardColor;
                collidesTiles = false;
            }}
        );

        // endregion Dimension Shard Ammo

        // region Hard Thorium Alloy Ammo

        BasicBulletType salvoThorium = (BasicBulletType) ((ItemTurret) Blocks.salvo).ammoTypes.get(Items.thorium);
        ((ItemTurret) Blocks.salvo).ammoTypes.put(
            DsItems.hardThoriumAlloy, new BasicBulletType(4, 44) {{
                lifetime = salvoThorium.lifetime;
                ammoMultiplier = 4;
                width = salvoThorium.width;
                height = salvoThorium.height * 1.4F;
                frontColor = salvoThorium.frontColor.cpy().lerp(DsColors.hardThoriumAlloyColor, 0.5F);
                backColor = salvoThorium.backColor.cpy().lerp(DsColors.hardThoriumAlloyColorLight, 0.5F);
                pierceCap = 2;
                pierceBuilding = true;
            }}
        );

        BasicBulletType spectreThorium = (BasicBulletType) ((ItemTurret) Blocks.spectre).ammoTypes.get(Items.thorium);
        ((ItemTurret) Blocks.spectre).ammoTypes.put(
            DsItems.hardThoriumAlloy, new BasicBulletType(8, 135) {{
                lifetime = spectreThorium.lifetime;
                knockback = spectreThorium.knockback;
                shootEffect = spectreThorium.shootEffect;
                width = spectreThorium.width;
                height = spectreThorium.height * 1.4F;
                frontColor = spectreThorium.frontColor.cpy().lerp(DsColors.hardThoriumAlloyColor, 0.5F);
                backColor = spectreThorium.backColor.cpy().lerp(DsColors.hardThoriumAlloyColorLight, 0.5F);
                ammoMultiplier = 2;
                pierceCap = 4;
                pierceBuilding = true;
            }}
        );

        // endregion Hard Thorium Alloy Ammo

        // region Space Crystal Ammo
        ((ItemTurret) Blocks.foreshadow).ammoTypes.put(
            DsItems.spaceCrystal, new PointBulletType() {
                {
                    shootEffect = DsFx.fxForeshadowSpaceShoot;
                    hitEffect = DsFx.fxBlackHoleExplodeDamaged;
                    smokeEffect = Fx.smokeCloud;
                    trailEffect = DsFx.fxForeshadowSpaceShootTrial;
                    despawnEffect = Fx.none;
                    trailSpacing = 20;
                    damage = 0;
                    buildingDamageMultiplier = 0.5F;
                    speed = 500;
                    hitShake = 8;
                    ammoMultiplier = 1;
                    reloadMultiplier = 0.6F;
                    hitSize = 100;
                    splashDamageRadius = 80;
                    splashDamage = 75;
                    knockback = -0.55F;
                }

                @Override
                public void removed(Bullet b) {
                    DsBullets.blackHoleDamaged.create(b, b.x, b.y, 0);
                    super.removed(b);
                }
            }
        );
        // endregion Space Crystal Ammo

        // region Liquid Ammo
        ((LiquidTurret) Blocks.wave).ammoTypes.put(DsItems.timeFlow, new LiquidBulletType(DsItems.timeFlow) {{
            knockback = 1;
            drag = 0.03F;
            status = DsStatusEffects.timeFreezingEffect;
        }});

        ((LiquidTurret) Blocks.tsunami).ammoTypes.put(DsItems.timeFlow, new LiquidBulletType(DsItems.timeFlow) {{
            lifetime = 49;
            speed = 4;
            knockback = 2;
            puddleSize = 8;
            drag = 0.001F;
            ammoMultiplier = 0.4F;
            statusDuration = 60 * 4;
            damage = 0.4F;
            status = DsStatusEffects.timeFreezingEffect;
        }});

        ((LiquidTurret) Blocks.wave).ammoTypes.put(DsItems.ionLiquid, new LiquidBulletType(DsItems.ionLiquid) {{
            knockback = 1;
            damage = 20;
            drag = 0.03F;
            status = DsStatusEffects.ionBurningEffect;
        }});
        ((LiquidTurret) Blocks.tsunami).ammoTypes.put(DsItems.ionLiquid, new LiquidBulletType(DsItems.ionLiquid) {{
            lifetime = 49;
            speed = 4;
            knockback = 1.3F;
            puddleSize = 8;
            drag = 0.001F;
            ammoMultiplier = 0.4F;
            statusDuration = 60 * 4;
            damage = 25F;
            status = DsStatusEffects.ionBurningEffect;
        }});
        // endregion Liquid Ammo
    }
}
