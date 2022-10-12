package dimensionshard.entities.bullets;

import arc.graphics.Color;
import arc.math.Angles;
import arc.math.Interp;
import arc.math.Mathf;
import arc.math.geom.Rect;
import arc.math.geom.Vec2;
import arc.util.Time;
import arc.util.Tmp;
import dimensionshard.DsColors;
import dimensionshard.DsFx;
import dimensionshard.DsStatusEffects;
import mindustry.content.Fx;
import mindustry.entities.Damage;
import mindustry.entities.Effect;
import mindustry.entities.Lightning;
import mindustry.entities.Units;
import mindustry.entities.bullet.ContinuousLaserBulletType;
import mindustry.gen.Bullet;

/**
 * 黑光
 *
 * @author abomb4 2022-10-09
 */
public class DarkLightBulletType extends ContinuousLaserBulletType {

    protected Rect rect = new Rect();
    protected Vec2 tr = new Vec2();
    protected Vec2 tr2 = new Vec2();

    public float dragRadius = 9 * 8;
    public float dragPower = 3.8F;
    public float lightningSpacing = 45;
    public float lightningLength = 6;
    public float lightningLengthRand = 12;
    public float lightningDelay = 1.1F;
    public float lightningAngleRand = 35;
    public float lightningDamage = 50;
    public Color lightningColor = Color.valueOf("a108f5");

    public DarkLightBulletType() {
        this.shake = 1.5F;
        this.largeHit = true;
        this.shootEffect = Fx.none;
        this.hitEffect = DsFx.fxDarkLightHit;
        this.smokeEffect = Fx.none;
        this.trailEffect = Fx.none;
        this.despawnEffect = Fx.none;
        // this.status = StatusEffects.sapped;
        this.statusDuration = 120;
        this.length = 42 * 8;
        this.width = 12;
        this.incendChance = 0;
        this.colors = new Color[]{
            DsColors.laserColor1,
            DsColors.laserColor2,
            DsColors.laserColor3,
            DsColors.laserColor4,
        };
        this.hitColor = DsColors.laserColor3;
        this.lightColor = DsColors.laserColor3;
    }

    protected void rotate(float ox, float oy, float nx, float ny, float rotation) {
        this.tr2.set(nx, ny).sub(ox, oy).rotate(-rotation);
    }

    protected float dragPowerPercent(float dst, float radius) {
        return Interp.sineOut.apply(1 - dst / radius);
    }

    @Override
    public void update(Bullet b) {
        var length = Damage.findLaserLength(b, this.length);
        if (b.timer.get(1, 2)) {
            // Drag them
            // calculate them
            this.tr.trns(b.rotation(), length);
            this.rect.setPosition(b.x, b.y).setSize(this.tr.x, this.tr.y);

            if (this.rect.width < 0) {
                this.rect.x += this.rect.width;
                this.rect.width *= -1;
            }

            if (this.rect.height < 0) {
                this.rect.y += this.rect.height;
                this.rect.height *= -1;
            }

            var expand = this.dragRadius * 1.4;

            this.rect.y -= expand;
            this.rect.x -= expand;
            this.rect.width += expand * 2;
            this.rect.height += expand * 2;

            Units.nearbyEnemies(b.team, this.rect, ((u -> {
                var rotation = b.rotation();
                this.rotate(b.x, b.y, u.x, u.y, rotation);
                var x = this.tr2.x;
                var y = this.tr2.y;
                var absY = Math.abs(y);
                if (x < 0 || x > length || absY > this.dragRadius) {
                    return;
                }
                // drag to the line
                var power = this.dragPowerPercent(absY, this.dragRadius);
                var angle = y > 0 ? rotation - 90 : rotation + 90;
                Tmp.v3.trns(angle, 80).scl(this.dragPower * power);
                var realPower = Tmp.v3.len() / u.mass();
                // print('pre power: ' + Tmp.v3.len() + ', real power: ' + realPower);
                // If too close, stop it moving
                if (absY < 3 && realPower > u.type.speed) {
                    // print('stop moving: ' + u + ', u.type.speed: ' + u.type.speed + ', realPower: ' + realPower);
                    u.vel.limit(0);
                    u.apply(DsStatusEffects.darkLightedEffect, 3);
                } else {
                    u.impulse(Tmp.v3);
                    u.vel.limit(absY);
                }
            })));
        }

        if (b.timer.get(2, 5)) {
            Damage.collideLine(b, b.team, this.hitEffect, b.x, b.y, b.rotation(), this.length, this.largeHit);
        }

        if (this.lightningSpacing > 0 && b.timer.get(3, 59)) {
            var idx = 0;
            var rot = b.rotation();
            // lightningSound.at(b.x + Angles.trnsx(rot, length / 2), b.y + Angles.trnsy(rot, length / 2));
            for (var i = (this.lightningSpacing + Mathf.random(this.lightningSpacing)) / 2;
                 i <= length; i += this.lightningSpacing) {
                var cx = b.x + Angles.trnsx(rot, i);
                var cy = b.y + Angles.trnsy(rot, i);

                var f = idx++;

                for (var s : Mathf.signs) {
                    Time.run(f * this.lightningDelay, (() -> {
                        if (b.isAdded() && b.type == this) {
                            Lightning.create(b, this.lightningColor, this.lightningDamage,
                                cx, cy, rot + 90 * s + Mathf.range(this.lightningAngleRand),
                                (int) (this.lightningLength + Mathf.random(this.lightningLengthRand)));
                        }
                    }));
                }
            }
        }

        if (this.shake > 0) {
            Effect.shake(this.shake, this.shake, b);
        }
    }
}
