package dimensionshard.types.bullets;

import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Interp;
import arc.math.Mathf;
import arc.math.geom.Rect;
import arc.util.Time;
import arc.util.Tmp;
import dimensionshard.DsItems;
import mindustry.content.Fx;
import mindustry.entities.Damage;
import mindustry.entities.Units;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.game.Team;
import mindustry.gen.Bullet;

/**
 * 向中间吸附
 *
 * @author abomb4 2022-10-08
 */
public class BlackHoleBulletType extends BasicBulletType {

    /** 隔几个 tick 触发一次伤害 */
    public int damageTicks = 5;

    public BlackHoleBulletType() {
        lifetime = 60;
        knockback = -0.55F;
        splashDamage = 15;
        splashDamageRadius = 80;
        shootEffect = Fx.none;
        hitEffect = Fx.none;
        smokeEffect = Fx.none;
        trailEffect = Fx.none;
        despawnEffect = Fx.none;
        damage = 0;
        speed = 0;
        collides = false;
        collidesAir = false;
        collidesGround = false;
        absorbable = false;
        hittable = false;
        keepVelocity = false;
        reflectable = false;
    }

    /**
     * 计算吸力百分比
     *
     * @param centerX 吸收中心 x
     * @param centerY 吸收中心 y
     * @param unitX   单位所在 x
     * @param unitY   单位所在 y
     * @param radius  吸收能力半径
     * @return 吸力百分比
     */
    public float percent(float centerX, float centerY, float unitX, float unitY, float radius) {
        float dst = Mathf.dst(centerX, centerY, unitX, unitY);
        float falloff = 0.4F;
        return Mathf.lerp(1 - dst / radius, 1, falloff);
    }

    @Override
    public void draw(Bullet b) {
        float fin = b.time / this.lifetime;
        float fout = 1 - fin;
        Draw.color(DsItems.spaceCrystalColor, DsItems.spaceCrystalColorLight, fout * 0.8F + 0.2F);
        Draw.alpha(0.4F * fin + 0.6F);
        Lines.stroke(fin * 3);
        Lines.circle(b.x, b.y, Mathf.sin(fout) * splashDamageRadius);

        Draw.color(DsItems.spaceCrystalColor);
        Draw.alpha(Mathf.clamp(9 * fout, 0, 1));
        Fill.circle(b.x, b.y, (Interp.pow2Out.apply(fout) + 0.2F) * splashDamageRadius / 10F);
    }

    @Override
    public void update(Bullet b) {
        float x = b.x;
        float y = b.y;
        Team team = b.team;
        Rect rect = new Rect();
        rect.setSize(this.splashDamageRadius * 2).setCenter(x, y);

        Units.nearbyEnemies(team, rect, unit -> {
            if (unit.team == team || !unit.within(x, y, this.splashDamageRadius)) {
                return;
            }
            float p = percent(x, y, unit.getX(), unit.getY(), this.splashDamageRadius);

            // drag
            unit.impulse(Tmp.v3.set(unit).sub(x, y).nor().scl(this.knockback * p * 80 * Time.delta));
            unit.vel.limit(3);
        });

        // Damage per 5 ticks (damage 12 times expected, full damage once expected)
        if (b.timer.get(1, damageTicks)) {
            int rangeStages = 6;
            float fullDamage = this.splashDamage / 60 * damageTicks * Time.delta * b.damageMultiplier();
            for (int i = 1; i <= rangeStages; i++) {
                float p = i / (rangeStages * 0.8F + 0.2F);
                Damage.damage(b.team, x, y, this.splashDamageRadius * p, fullDamage * p, true, true);
            }
        }
    }
}
