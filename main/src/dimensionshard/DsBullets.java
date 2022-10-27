package dimensionshard;

import dimensionshard.types.bullets.BlackHoleBulletType;
import dimensionshard.types.bullets.ElectricStormBulletType;
import dimensionshard.types.bullets.IonBoltBulletType;
import mindustry.content.Fx;

import static dimensionshard.DsItems.ionLiquid;

/**
 * 默认弹药
 *
 * @author abomb4 2022-10-07
 */
@SuppressWarnings("UnqualifiedFieldAccess")
public final class DsBullets {

    /** 离子射弹的破片 1 */
    public static ElectricStormBulletType standardIonFrag1;
    /** 离子射弹的破片 2 */
    public static ElectricStormBulletType standardIonFrag2;
    /** 离子射弹的破片 3 */
    public static ElectricStormBulletType standardIonFrag3;
    /** 离子射弹 1 */
    public static IonBoltBulletType standardIonBolt1;
    /** 离子射弹 2 */
    public static IonBoltBulletType standardIonBolt2;
    /** 离子射弹 */
    public static IonBoltBulletType standardIonBolt;

    /** 小黑洞 */
    public static BlackHoleBulletType blackHole;
    /** 伤害型黑洞 */
    public static BlackHoleBulletType blackHoleDamaged;

    public static void load() {
        standardIonFrag1 = new ElectricStormBulletType() {{
            lifetime = 16;
            speedStart = 2.5F;
            damage = 1;
            pierceCap = 2;
            splashDamage = 1;
            splashDamageRadius = 24;
            lightning = 1;
            lightningLength = 3;
            lightningDamage = 8;
            lightningColor = ionLiquid.color;
            frontColor = ionLiquid.color;
            flyingLightningDamage = 12;
            flyingLightningColor = ionLiquid.color;
            flyingLightningChange = 0.07F;
        }};
        standardIonFrag2 = new ElectricStormBulletType() {{
            lifetime = 18;
            speedStart = 2.5F;
            damage = 1;
            pierceCap = 2;
            splashDamage = 1;
            splashDamageRadius = 24;
            lightning = 1;
            lightningLength = 3;
            lightningDamage = 26;
            lightningColor = ionLiquid.color;
            frontColor = ionLiquid.color;
            flyingLightningDamage = 18;
            flyingLightningColor = ionLiquid.color;
            flyingLightningChange = 0.07F;
        }};
        standardIonFrag3 = new ElectricStormBulletType() {{
            lifetime = 20;
            speedStart = 2.5F;
            damage = 1;
            pierceCap = 2;
            splashDamage = 1;
            splashDamageRadius = 24;
            lightning = 2;
            lightningLength = 3;
            lightningDamage = 30;
            lightningColor = ionLiquid.color;
            frontColor = ionLiquid.color;
            flyingLightningDamage = 18;
            flyingLightningColor = ionLiquid.color;
            flyingLightningChange = 0.07F;
        }};

        standardIonBolt = new IonBoltBulletType();
        standardIonBolt1 = new IonBoltBulletType() {{
            speed = 4.6F;
            lifetime = 38;
            fragBullets = 1;
            fragBullet = standardIonFrag1;
            width = 2;
            height = 8;
            damage = 10;
            lightning = 1;
            lightningDamage = 16;
            lightningLength = 5;
            lightningLengthRand = 0;
            splashDamageRadius = 26;
            splashDamage = 20;
            hitEffect = Fx.explosion;
            puddles = 2;
            puddleAmount = 8;
        }};
        standardIonBolt2 = new IonBoltBulletType() {{
            speed = 4.8F;
            lifetime = 42;
            fragBullets = 1;
            width = 3;
            height = 9;
            damage = 25;
            lightningDamage = 18;
            lightningLength = 5;
            lightningLengthRand = 0;
            splashDamageRadius = 28;
            hitEffect = Fx.explosion;
            puddles = 2;
            puddleAmount = 9;
        }};

        blackHole = new BlackHoleBulletType() {{
            lifetime = 60;
            knockback = -0.55F;
            splashDamage = 15;
            splashDamageRadius = 80;
        }};

        blackHoleDamaged = new BlackHoleBulletType() {{
            lifetime = 120;
            knockback = -0.65F;
            splashDamage = 80;
            splashDamageRadius = 160;
        }};
    }
}
