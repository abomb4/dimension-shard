package dimensionshard.types.blocks;

import arc.audio.Sound;
import arc.func.Cons;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Mathf;
import arc.math.geom.Intersector;
import dimensionshard.DsColors;
import mindustry.content.Fx;
import mindustry.content.Items;
import mindustry.gen.Building;
import mindustry.gen.Bullet;
import mindustry.gen.Groups;
import mindustry.gen.Sounds;
import mindustry.graphics.Layer;
import mindustry.type.Category;
import mindustry.type.ItemStack;
import mindustry.world.blocks.defense.ForceProjector;
import mindustry.world.meta.Stat;
import mindustry.world.meta.StatUnit;

import static dimensionshard.DsItems.spaceCrystal;
import static mindustry.Vars.renderer;

/**
 * 反弹力场投影器
 *
 * @author abomb4 2022-10-26
 */
public class DeflectForceProjector extends ForceProjector {

    /** 反弹几率与伤害相关 */
    public float chanceDeflect = 10;
    /** 反射角度 */
    public float deflectAngle = 60;
    /** 反射声音 */
    public Sound deflectSound = Sounds.none;
    /** 盾牌颜色 */
    public Color shieldColor = DsColors.spaceCrystalColorLight;

    /** 盾 */
    protected final Cons<Bullet> shieldConsumer = trait -> {
        if (trait.team != paramEntity.team
            && trait.type.absorbable
            &&
            Intersector.isInsideHexagon(paramEntity.x, paramEntity.y, paramEntity.realRadius() * 2, trait.x, trait.y)) {
            if (!this.deflect(paramEntity, trait)) {
                trait.absorb();
                Fx.absorb.at(trait);
            }
            paramEntity.hit = 1;
            paramEntity.buildup += trait.damage * paramEntity.warmup;
        }
    };

    /** 尝试反弹 */
    public boolean deflect(Building building, Bullet bullet) {
        //deflect bullets if necessary
        if (this.chanceDeflect > 0) {
            //slow bullets are not deflected
            if (bullet.vel.len() <= 0.1 || !bullet.type.reflectable) {
                return false;
            }

            //bullet reflection chance depends on bullet damage
            if (!Mathf.chance(this.chanceDeflect / bullet.damage)) {
                return false;
            }

            //make sound
            this.deflectSound.at(building.tile, Mathf.random(0.9F, 1.1F));

            //translate bullet back to where it was upon collision
            bullet.vel.x *= -1;
            bullet.vel.y *= -1;
            // Add a random angle
            bullet.vel.setAngle(Mathf.random(this.deflectAngle) - this.deflectAngle / 2 + bullet.vel.angle());

            bullet.owner = building;
            bullet.team = building.team;
            bullet.time = (bullet.time + 1);

            return true;
        }
        return false;
    }

    public DeflectForceProjector(String name) {
        super(name);

        this.size = 3;
        this.radius = 100;
        this.phaseRadiusBoost = 100;
        this.phaseShieldBoost = 500;
        this.shieldHealth = 700;
        this.cooldownNormal = 1.5F;
        this.cooldownLiquid = 1.2F;
        this.cooldownBrokenBase = 0.35F;
        this.itemConsumer = consumeItem(spaceCrystal).boost();
        this.consumePower(12);

        this.requirements(Category.effect, ItemStack.with(
            Items.lead, 120,
            Items.silicon, 150,
            Items.titanium, 100,
            Items.phaseFabric, 80,
            spaceCrystal, 40
        ));
    }

    @Override
    public void setStats() {
        super.setStats();
        if (this.chanceDeflect > 0) {
            this.stats.add(Stat.baseDeflectChance, this.chanceDeflect, StatUnit.none);
        }
    }

    public class DeflectForceProjectorBuild extends ForceProjector.ForceBuild {

        @Override
        public void deflectBullets() {
            float realRadius = this.realRadius();

            if (realRadius > 0 && !this.broken) {
                paramEntity = this;
                paramEffect = DeflectForceProjector.this.absorbEffect;
                Groups.bullet.intersect(this.x - realRadius, this.y - realRadius, realRadius * 2, realRadius * 2,
                    DeflectForceProjector.this.shieldConsumer);
            }
        }

        @Override
        public void drawShield() {
            if (!this.broken) {
                float radius = this.realRadius();

                Draw.z(Layer.shields);

                Draw.color(DeflectForceProjector.this.shieldColor, Color.white, Mathf.clamp(this.hit));

                if (renderer.animateShields) {
                    Fill.poly(this.x, this.y, 6, radius);
                } else {
                    Lines.stroke(1.5f);
                    Draw.alpha(0.09f + Mathf.clamp(0.08f * this.hit));
                    Fill.poly(this.x, this.y, 6, radius);
                    Draw.alpha(1f);
                    Lines.poly(this.x, this.y, 6, radius);
                    Draw.reset();
                }
            }

            Draw.reset();
        }
    }
}
