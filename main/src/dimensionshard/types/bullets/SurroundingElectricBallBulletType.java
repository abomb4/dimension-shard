package dimensionshard.types.bullets;

import arc.Core;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Mathf;
import arc.math.geom.Position;
import arc.math.geom.Vec2;
import arc.util.Time;
import arc.util.Tmp;
import dimensionshard.libs.Lib;
import mindustry.Vars;
import mindustry.entities.Effect;
import mindustry.entities.Lightning;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.gen.Bullet;

/**
 * 环绕闪电球
 *
 * @author abomb4 2022-11-23 09:36:32
 */
public class SurroundingElectricBallBulletType extends BasicBulletType {

    public static Effect fxLightningLine = new Effect(8, 500, (e -> {
        Lines.stroke(3 * e.fout());
        Draw.color(e.color, Color.white, e.fin());

        final SurroundingElectricBallData data = (SurroundingElectricBallData) e.data;
        Lines.line(data.p1x, data.p1y, data.p2x, data.p2y, false);
        Fill.circle(data.p1x, data.p1y, Lines.getStroke() / 2);
        Fill.circle(data.p2x, data.p2y, Lines.getStroke() / 2);
    }));

    private float angleSpeed;

    private float radiusSpeed;
    private float radius;
    private Color flyingLightningColor;
    private float flyingLightningDamage;
    private float flyingLightningChange;
    private int flyingLightningLength;
    private float flyingLightningCooldown;

    public SurroundingElectricBallBulletType() {
        sprite = Lib.modName + "-surrounding-electric-ball";
        damage = 20;
        speed = 0.1F;
        lifetime = 180;
        pierceCap = 4;
        pierce = true;
        pierceBuilding = false;
        width = 30;
        height = 30;
        shrinkY = 0;
        shrinkX = 0;
        homingDelay = 0;
        homingPower = 0;
        homingRange = 0;
        splashDamageRadius = 3 * 8;
        splashDamage = 30;
        weaveMag = 8;
        weaveScale = 6;
        spin = 6;
        lightning = 2;
        lightningLength = 8;
        lightningLengthRand = 8;
        lightningCone = 360;
        lightningAngle = 0;
        lightningDamage = 22;
        lightningColor = Color.valueOf("69dcee");
        backColor = new Color(255, 255, 255, 0);
        frontColor = Color.valueOf("79ecfe");

        // custom
        angleSpeed = 5.5F;
        radiusSpeed = 64 / 30F;
        radius = 64;
        flyingLightningColor = Color.valueOf("69dcee");
        flyingLightningDamage = 18;
        flyingLightningChange = 0.07F;
        flyingLightningLength = 10;
        flyingLightningCooldown = 7;
    }

    @Override
    public void init(Bullet b) {
        super.init(b);
        SurroundingElectricBallData data;
        if (b.data == null) {
            data = new SurroundingElectricBallData();
            b.data = data;
        } else {
            data = (SurroundingElectricBallData) b.data;
        }
        data.flyingLightningCooldown = flyingLightningCooldown;
        data.animationDisabled = shouldDisableAnimation();
        data.center = b.owner != null ? (Position) b.owner : new Vec2(b.x, b.y);
        data.baseRad = b.rotation();
        data.rotation = 0;
        data.len = 0;
    }

    public boolean shouldDisableAnimation() {
        return Core.graphics.getFramesPerSecond() <= 50;
    }

    @Override
    public void update(Bullet b) {
        // Calculate rotate end position and move to
        final SurroundingElectricBallData data = (SurroundingElectricBallData) b.data;
        Tmp.v1.trns(data.baseRad + data.rotation, data.len)
            .add(data.center.getX(), data.center.getY())
            .sub(b.x, b.y);
        b.move(Tmp.v1.x, Tmp.v1.y);

        if (this.trailChance > 0) {
            if (Mathf.chanceDelta(this.trailChance)) {
                this.trailEffect.at(b.x, b.y, this.trailParam, this.trailColor);
            }
        }

        if (flyingLightningChange > 0 && data.flyingLightningCooldown <= 0) {
            if (Mathf.chanceDelta(flyingLightningChange)) {
                for (var i = 0; i < lightning / 2; i++) {
                    Lightning.create(b, lightningColor, flyingLightningDamage, b.x, b.y, Mathf.range(360),
                        flyingLightningLength);
                }
                data.flyingLightningCooldown = flyingLightningCooldown;
            }
        }

        if (!Vars.headless && Core.settings.getBool("bloom") && !Core.settings.getBool("pixelate") &&
            !data.animationDisabled) {
            // effect
            data.animationDisabled = shouldDisableAnimation();
            var radius = 4;
            var radiusRandom = 12;
            for (var i = 0; i < 3; i++) {
                var angle = Mathf.range(360);
                var angle2 = Mathf.range(120) + 120;
                Tmp.v1.trns(angle, radius + Mathf.range(radiusRandom));
                Tmp.v2.trns(angle2, radius + Mathf.range(radiusRandom));

                final SurroundingElectricBallData bd = new SurroundingElectricBallData();
                bd.p1x = b.x + Tmp.v1.x;
                bd.p1y = b.y + Tmp.v1.y;
                bd.p2x = b.x + Tmp.v2.x;
                bd.p2y = b.y + Tmp.v2.y;
                fxLightningLine.at(b.x, b.y, 0, this.lightningColor, bd);
            }
        }

        data.flyingLightningCooldown = Math.max(data.flyingLightningCooldown - 1, 0);
        data.len = Math.min(data.len + radiusSpeed * Time.delta, radius);
        data.rotation += angleSpeed * Time.delta;
        data.rotation %= 360;
    }

    public static class SurroundingElectricBallData {
        public float p1x;
        public float p1y;
        public float p2x;
        public float p2y;
        public float flyingLightningCooldown;

        public boolean animationDisabled;
        public Position center;
        public float baseRad;
        public float rotation;
        public float len;
    }
}
