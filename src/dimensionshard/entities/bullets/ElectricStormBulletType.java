package dimensionshard.entities.bullets;

import arc.Core;
import arc.graphics.Color;
import arc.math.Mathf;
import arc.math.geom.Vec2;
import arc.util.Time;
import dimensionshard.DsFx;
import dimensionshard.libs.Lib;
import mindustry.Vars;
import mindustry.entities.Lightning;
import mindustry.entities.Units;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.gen.Bullet;
import mindustry.gen.Teamc;

/**
 * 闪电风暴球体
 *
 * @author abomb4 2022-10-07
 */
public class ElectricStormBulletType extends BasicBulletType {
    public static final Vec2 tmp = new Vec2();
    public static final Vec2 tmp2 = new Vec2();

    /** 有目标后的加速度 */
    public float accelerate;
    /** 起始速度 */
    public float speedStart;
    /** 最高速度 */
    public float speedFull;
    /** 飞行过程中的闪电颜色 */
    public Color flyingLightningColor;
    /** 飞行过程中的闪电伤害 */
    public float flyingLightningDamage;
    /** 飞行过程中闪电的几率 */
    public float flyingLightningChange;
    /** 飞行过程中闪电的长度 */
    public int flyingLightningLength;
    /** 飞行过程中闪电的冷却，即最短出现间隔 */
    public float flyingLightningCooldown;

    public ElectricStormBulletType() {
        var transparentColor = new Color(255, 255, 255, 0);
        this.sprite = Lib.modName + "-electric-storm";

        this.damage = 50;
        this.speed = 3;
        this.lifetime = 180;
        this.pierceCap = 10;
        this.pierce = true;
        this.pierceBuilding = false;
        this.width = 20;
        this.height = 20;
        this.shrinkY = 0;
        this.shrinkX = 0;
        this.homingDelay = 30;
        this.homingPower = 0.025F;
        this.homingRange = 200;
        this.splashDamageRadius = 6 * 8;
        this.splashDamage = 70;
        this.weaveMag = 8;
        this.weaveScale = 6;
        this.spin = 32.31234F;
        this.lightning = 2;
        this.lightningLength = 10;
        this.lightningLengthRand = 8;
        this.lightningCone = 360;
        this.lightningAngle = 0;
        this.lightningDamage = 50;
        this.lightningColor = Color.valueOf("69dcee");
        this.backColor = transparentColor;
        this.frontColor = Color.valueOf("79ecfe");

        // custom
        this.accelerate = 0.25F;
        this.speedStart = 1;
        this.speedFull = 5;
        this.flyingLightningColor = Color.valueOf("69dcee");
        this.flyingLightningDamage = 36;
        this.flyingLightningChange = 0.07F;
        this.flyingLightningLength = 8;
        this.flyingLightningCooldown = 6;
    }

    @Override
    public void init(Bullet b) {
        super.init(b);
        ElectricStormBulletData data;
        if (b.data == null) {
            data = new ElectricStormBulletData();
            b.data = data;
        } else {
            data = (ElectricStormBulletData) b.data;
        }
        b.vel.trns(b.vel.angle(), this.speedStart);
        data.speed = this.speedStart;
        data.homingSpeedUp = 0;
        data.flyingLightningCooldown = this.flyingLightningCooldown;
        data.animationDisabled = this.shouldDisableAnimation();
    }

    @Override
    public void update(Bullet b) {
        ElectricStormBulletData data = (ElectricStormBulletData) b.data;
        if (this.homingPower >= 0.0001 && b.time >= this.homingDelay) {
            // var acceleratePercent = (b.data.speed - speedStart) / (speedFull - speedStart)
            if (data.target == null) {
                data.target = Units.closestTarget(b.team, b.x, b.y, this.homingRange,
                    e -> (e.isGrounded() && this.collidesGround)
                        || (e.isFlying() && this.collidesAir), t -> this.collidesGround);
            }

            if (data.target != null) {
                // 1/4 seconds to increase homing power
                b.vel.setAngle(
                    Mathf.slerpDelta(b.rotation(), b.angleTo(data.target),
                        this.homingPower + (Math.max(0, data.homingSpeedUp - 15)) * this.homingPower));
                // accelerate bullet
                data.speed = Math.min(data.speed + this.accelerate, this.speedFull);
                b.vel.trns(b.vel.angle(), data.speed);
                data.homingSpeedUp += 1;
            }
        }

        if (data.target != null && b.dst(data.target) <= 5) {
            b.remove();
            return;
        }

        if (this.weaveMag > 0) {
            var scl = Mathf.randomSeed(this.id, 0.9F, 1.1F);
            b.vel.rotate(
                Mathf.sin(b.time + Mathf.PI * this.weaveScale / 2 * scl, this.weaveScale * scl, this.weaveMag) *
                    Time.delta);
        }

        if (this.trailChance > 0) {
            if (Mathf.chanceDelta(this.trailChance)) {
                this.trailEffect.at(b.x, b.y, this.trailParam, this.trailColor);
            }
        }

        if (this.flyingLightningChange > 0 && data.flyingLightningCooldown <= 0) {
            if (Mathf.chanceDelta(this.flyingLightningChange)) {
                for (var i = 0; i < this.lightning / 2; i++) {
                    Lightning.create(b, this.lightningColor, this.flyingLightningDamage, b.x, b.y, Mathf.range(360),
                        this.flyingLightningLength);
                }
                data.flyingLightningCooldown = this.flyingLightningCooldown;
            }
        }

        if (!Vars.headless && Core.settings.getBool("bloom") && !Core.settings.getBool("pixelate") &&
            !data.animationDisabled) {
            // effect
            data.animationDisabled = this.shouldDisableAnimation();
            var radius = 4;
            var radiusRandom = 12;
            for (var i = 0; i < 3; i++) {
                var angle = Mathf.range(360);
                var angle2 = Mathf.range(120) + 120;
                tmp.trns(angle, radius + Mathf.range(radiusRandom));
                tmp2.trns(angle2, radius + Mathf.range(radiusRandom));

                DsFx.fxLightningLine.at(b.x, b.y, 0, this.lightningColor, new DsFx.FxLightningLineEffectData(
                    b.x + tmp.x,
                    b.y + tmp.y,
                    b.x + tmp2.x,
                    b.y + tmp2.y
                ));
            }
        }

        data.flyingLightningCooldown = Math.max(data.flyingLightningCooldown - 1, 0);
    }

    /**
     * 是否禁止动画
     *
     * @return 是否
     */
    public boolean shouldDisableAnimation() {
        return Core.graphics.getFramesPerSecond() <= 50;
    }

    /** 闪电风暴子弹运行数据 */
    public static class ElectricStormBulletData {
        /** 当前速度 */
        public float speed;
        /** 跟踪拐弯能力提升幅度 */
        public float homingSpeedUp;
        /** 闪电冷却剩余时间 */
        public float flyingLightningCooldown;
        /** 是否停用了动画 */
        public boolean animationDisabled;
        /** 跟踪目标 */
        public Teamc target;
    }
}

