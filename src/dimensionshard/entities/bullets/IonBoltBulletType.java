package dimensionshard.entities.bullets;

import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Lines;
import dimensionshard.DsBullets;
import dimensionshard.DsItems;
import mindustry.content.Fx;
import mindustry.entities.Effect;
import mindustry.entities.bullet.LaserBoltBulletType;

import static dimensionshard.DsItems.ionLiquid;

/**
 * 离子射弹
 *
 * @author abomb4 2022-10-07
 */
public class IonBoltBulletType extends LaserBoltBulletType {

    public static final Effect fireEffect = new Effect(8, e -> {
        Draw.color(Color.white, ionLiquid.color, e.fin());
        Lines.stroke(0.5F + e.fout());
        Lines.circle(e.x, e.y, e.fin() * 5);
    });

    public IonBoltBulletType() {
        this.damage = 40;
        this.speed = 5.2F;
        this.lifetime = 48;
        this.width = 4;
        this.height = 11;
        this.shrinkY = 0;
        this.shrinkX = 0;
        this.ammoMultiplier = 1;
        this.hitEffect = Fx.massiveExplosion;
        this.smokeEffect = fireEffect;
        this.despawnEffect = fireEffect;
        this.splashDamageRadius = 32;
        this.splashDamage = 60;
        this.lightning = 2;
        this.lightningLength = 6;
        this.lightningLengthRand = 4;
        this.lightningCone = 360;
        this.lightningAngle = 90;
        this.lightningDamage = 30;
        this.lightningColor = ionLiquid.color;
        this.buildingDamageMultiplier = 0.8F;
        this.puddles = 2;
        this.puddleRange = 8;
        this.puddleAmount = 10;
        this.puddleLiquid = ionLiquid;
        this.status = DsItems.ionBurningEffect;
        this.statusDuration = 120;
        this.fragBullets = 1;
        this.fragBullet = DsBullets.standardIonFrag3;
        this.fragLifeMin = 0;
        this.fragLifeMax = 1;
        this.backColor = ionLiquid.color;
        this.frontColor = ionLiquid.color;
    }
}
