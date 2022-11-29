package dimensionshard.types.abilities;

import arc.audio.Sound;
import arc.func.Cons;
import arc.graphics.Color;
import arc.math.Mathf;
import arc.math.geom.Intersector;
import arc.util.Time;
import dimensionshard.DsColors;
import dimensionshard.libs.Lib;
import mindustry.content.Fx;
import mindustry.entities.abilities.Ability;
import mindustry.game.Team;
import mindustry.gen.Bullet;
import mindustry.gen.Groups;
import mindustry.gen.Sounds;
import mindustry.gen.Unit;

/**
 * 反射护盾力场能力
 *
 * @author abomb4 2022-11-23 10:11:57
 */
public class DeflectForceFieldAbility extends Ability {

    // definition fields

    public float radius = 60;
    public float regen = 0.1F;
    public float max = 200;
    public float cooldown = 60 * 5;
    public float chanceDeflect = 10;
    public float deflectAngle = 60;
    public Sound deflectSound = Sounds.none;
    public Color shieldColor = DsColors.spaceCrystalColorLight;

    // status fields

    public float radiusScale = 0;
    public float alpha = 0;
    public Unit paramUnit;
    public DeflectForceFieldAbility paramField;
    private float realRad;

    /** 护盾处理 */
    private final Cons<? super Bullet> shieldConsumer = trait -> {
        if (paramUnit != null
            && paramField != null
            && trait.team != paramUnit.team
            && trait.type.absorbable
            && paramUnit.shield > 0
            && Intersector.isInsideHexagon(paramUnit.x, paramUnit.y, realRad * 2, trait.x, trait.y)) {
            if (!deflect(paramUnit, chanceDeflect, trait)) {
                trait.absorb();
                Fx.absorb.at(trait);
            }
            //break shield
            if (paramUnit.shield <= trait.damage) {
                paramUnit.shield -= cooldown * regen;
                Fx.shieldBreak.at(paramUnit.x, paramUnit.y, radius, paramUnit.team.color);
            }

            paramUnit.shield -= trait.damage;
            paramField.setAlpha(1);
        }
    };

    /**
     * 尝试反弹
     *
     * @param unit          护盾单位
     * @param chanceDeflect 反弹几率
     * @param bullet        弹药
     * @return 是否反弹了
     */
    public boolean deflect(Unit unit, float chanceDeflect, Bullet bullet) {
        if (chanceDeflect <= 0) {
            return false;
        }
        final Team team = unit.team;
        // slow bullets are not deflected
        if (bullet.vel.len() <= 0.1 || !bullet.type.reflectable) {
            return false;
        }

        // bullet reflection chance depends on bullet damage
        if (!Mathf.chance(chanceDeflect / bullet.damage)) {
            return false;
        }

        // make sound
        deflectSound.at(unit, Mathf.random(0.9F, 1.1F));

        // translate bullet back to where it was upon collision
        bullet.vel.x *= -1;
        bullet.vel.y *= -1;
        // Add a random angle
        bullet.vel.setAngle(Mathf.random(deflectAngle) - deflectAngle / 2 + bullet.vel.angle());

        bullet.owner = unit;
        bullet.team = team;
        bullet.time = (bullet.time + 1);

        return true;
    }

    /**
     * set alpha
     *
     * @param alpha alpha
     */
    public void setAlpha(float alpha) {
        this.alpha = alpha;
    }

    @Override
    public String localized() {
        return Lib.getMessage("ability", "deflect-force-field");
    }

    @Override
    public void update(Unit unit) {
        if (unit.shield < max) {
            unit.shield += Time.delta * regen;
        }
        alpha = Math.max(alpha - Time.delta / 10, 0);
        if (unit.shield > 0) {
            radiusScale = Mathf.lerpDelta(radiusScale, 1, 0.06F);
            paramUnit = unit;
            paramField = this;

            realRad = radiusScale * radius;
            Groups.bullet.intersect(unit.x - realRad, unit.y - realRad, realRad * 2, realRad * 2, shieldConsumer);
        } else {
            radiusScale = 0;
        }
    }
}
