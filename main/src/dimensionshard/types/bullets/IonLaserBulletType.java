package dimensionshard.types.bullets;

import dimensionshard.DsStatusEffects;
import mindustry.content.Fx;
import mindustry.entities.bullet.LaserBulletType;

import static dimensionshard.DsItems.ionLiquid;

/**
 * 离子粗激光
 *
 * @author abomb4 2022-11-24 18:57:46
 */
public class IonLaserBulletType extends LaserBulletType {

    /** 离子激光破片 */
    public static ElectricStormBulletType standardIonLaserFrag = new ElectricStormBulletType() {{
        lifetime = 20;
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

    /** construct */
    public IonLaserBulletType() {
        length = 460;
        damage = 560;
        width = 75;
        lifetime = 65;
        lightningSpacing = 30;
        lightningLength = 6;
        lightningDelay = 1.1F;
        lightningLengthRand = 16;
        lightningDamage = 50;
        lightningAngleRand = 40;
        lightningColor = ionLiquid.color;
        lightColor = ionLiquid.color;
        largeHit = true;
        shootEffect = Fx.none;
        // fragBullets = 1;
        // fragBullet = standardIonLaserFrag;
        fragLifeMin = 0;
        fragLifeMax = 0.3F;
        collidesTeam = false;
        sideAngle = 15;
        sideWidth = 0;
        sideLength = 0;
        status = DsStatusEffects.ionBurningEffect;
        statusDuration = 120;
    }
}
