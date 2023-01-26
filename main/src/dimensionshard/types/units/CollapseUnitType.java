package dimensionshard.types.units;

import arc.Core;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Mathf;
import arc.struct.Seq;
import dimensionshard.DsBullets;
import dimensionshard.DsColors;
import dimensionshard.DsFx;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import mindustry.Vars;
import mindustry.content.Fx;
import mindustry.content.StatusEffects;
import mindustry.entities.Damage;
import mindustry.entities.Effect;
import mindustry.entities.UnitSorts;
import mindustry.entities.Units;
import mindustry.entities.bullet.PointBulletType;
import mindustry.gen.Bullet;
import mindustry.gen.Sounds;
import mindustry.graphics.Drawf;
import mindustry.graphics.Layer;
import mindustry.type.UnitType;
import mindustry.type.Weapon;
import mindustry.world.meta.BlockFlag;

/**
 * T5 进攻飞行器 - 崩坏
 *
 * @author abomb4 2022-11-15 23:43:15
 */
public class CollapseUnitType extends UnitType implements SkilledUnitType {

    /** teleport color */
    public static Color teleportColor = Color.valueOf("69dcee");

    /** shoot effect */
    public static Effect shootEffect = new Effect(16, 24, e -> {
        Draw.color(teleportColor);
        for (var i = 0; i < 4; i++) {
            Drawf.tri(e.x, e.y, 4, 24 * e.fout(), i * 90 + e.id * 10);
        }

        Lines.stroke(Math.max(0, e.fout() - 0.5F) * 2.5F);
        Lines.circle(e.x, e.y, 24 * e.finpow());

        Draw.color();
        for (var i = 0; i < 4; i++) {
            Drawf.tri(e.x, e.y, 2, 12 * e.fout(), i * 90 + e.id * 10);
        }
    });

    public float cooldown = 60 * 10;
    public float activeTime = 60 * 3;
    public float initRange = 50;
    public float maxRange = 120;
    public float rangeUpDmg = 1000;
    public float maxRangeDmg = 4000;
    public float damageDeflection = 0.25F;
    public Seq<SkillDefinition> skillDefinitions;

    /**
     * 根据反弹伤害计算伤害范围
     *
     * @param dmg 反弹伤害
     * @return 伤害范围
     */
    public float calculateRangeByDmg(float dmg) {
        var base = maxRangeDmg - rangeUpDmg;
        var percent = Math.min(1, Math.max(0, dmg - rangeUpDmg) / base);
        return initRange + (maxRange - initRange) * percent;
    }

    public CollapseUnitType() {
        super("collapse");

        this.constructor = SkilledUnitEntity::new;
        armor = 11;
        health = 17500;
        speed = 0.6F;
        rotateSpeed = 1;
        accel = 0.04F;
        drag = 0.04F;
        flying = true;
        engineOffset = 28;
        engineSize = 7.8F;
        // rotateShooting = false;
        hitSize = 60;
        lowAltitude = true;
        targetFlags = new BlockFlag[]{BlockFlag.turret, BlockFlag.core, null};
        faceTarget = false;
        // destructibleWreck = false;

        weapons.add(new Weapon(Lib.modName + "-collapse-weapon-0") {{
            mirror = false;
            shake = 4;
            shootY = 14;
            x = 0;
            y = -1;
            rotateSpeed = 4.2F;
            reload = 110;
            recoil = 2;
            shootCone = 5;
            shootSound = Lib.loadSound("bomb-teleport");
            shadow = 20;
            heatColor = teleportColor;
            cooldownTime = 100;
            rotate = true;
            bullet = new PointBulletType() {
                {
                    lifetime = 1;
                    shootEffect = CollapseUnitType.shootEffect;
                    hitEffect = DsFx.fxBlackHoleExplode;
                    smokeEffect = Fx.none;
                    trailEffect = DsFx.fxBombTeleporterShootTrial;
                    trailSpacing = 14;
                    despawnEffect = Fx.none;
                    hitSound = Sounds.explosion;
                    damage = 3;
                    splashDamageRadius = 80;
                    splashDamage = 15;
                    speed = 216;
                    hitShake = 2;
                    knockback = -0.55F;
                    ammoMultiplier = 1;
                    reflectable = false;
                    absorbable = false;
                }

                @Override
                public void hit(Bullet b, float x, float y) {
                    super.hit(b, x, y);
                    DsBullets.blackHole.create(b, x, y, 0);
                }
            };
        }});

        weapons.add(new Weapon(Lib.modName + "-collapse-weapon-1") {{
            shake = 4;
            shootY = 13;
            x = 23;
            y = 0;
            rotateSpeed = 4.3F;
            reload = 60;
            recoil = 2;
            shootCone = 5;
            shootSound = Lib.loadSound("bomb-teleport");
            shadow = 20;
            heatColor = teleportColor;
            cooldownTime = 90;
            rotate = true;
            bullet = new PointBulletType() {{
                lifetime = 1;
                shootEffect = CollapseUnitType.shootEffect;
                hitEffect = Fx.massiveExplosion;
                smokeEffect = Fx.smokeCloud;
                trailEffect = DsFx.fxBombTeleporterShootTrial;
                trailSpacing = 14;
                despawnEffect = Fx.none;
                hitSound = Sounds.explosion;
                damage = 3;
                splashDamageRadius = 34;
                splashDamage = 105;
                status = StatusEffects.blasted;
                speed = 216;
                hitShake = 2;
                reflectable = false;
                absorbable = false;
            }};
        }});

        weapons.add(new Weapon(Lib.modName + "-collapse-weapon-2") {{
            shake = 4;
            shootY = 10;
            x = 12;
            y = 20;
            rotateSpeed = 4.1F;
            reload = 45;
            recoil = 2;
            shootCone = 5;
            shootSound = Lib.loadSound("bomb-teleport");
            shadow = 20;
            heatColor = teleportColor;
            cooldownTime = 70;
            rotate = true;
            bullet = new PointBulletType() {{
                lifetime = 1;
                shootEffect = CollapseUnitType.shootEffect;
                hitEffect = DsFx.fxDimensionShardExplosion;
                smokeEffect = Fx.none;
                trailEffect = DsFx.fxBombTeleporterShootTrial;
                trailSpacing = 14;
                despawnEffect = Fx.none;
                hitSound = Sounds.explosion;
                damage = 3;
                splashDamageRadius = 32;
                splashDamage = 70;
                speed = 192;
                hitShake = 1.6F;
                reflectable = false;
                absorbable = false;
            }};
        }});

        weapons.add(new Weapon(Lib.modName + "-collapse-weapon-2") {{
            shake = 4;
            shootY = 10;
            x = 13;
            y = -20;
            rotateSpeed = 4;
            reload = 36;
            recoil = 2;
            shootCone = 5;
            shootSound = Lib.loadSound("bomb-teleport");
            shadow = 20;
            heatColor = teleportColor;
            cooldownTime = 50;
            rotate = true;
            bullet = new PointBulletType() {{
                lifetime = 1;
                shootEffect = CollapseUnitType.shootEffect;
                hitEffect = DsFx.fxDimensionShardExplosion;
                smokeEffect = Fx.none;
                trailEffect = DsFx.fxBombTeleporterShootTrial;
                trailSpacing = 14;
                despawnEffect = Fx.none;
                hitSound = Sounds.explosion;
                damage = 3;
                splashDamageRadius = 32;
                splashDamage = 70;
                speed = 192;
                hitShake = 1.6F;
                reflectable = false;
                absorbable = false;
            }};
        }});
    }

    @Override
    public void load() {
        super.load();
        this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description",
            cooldown / 60,
            activeTime / 60,
            damageDeflection * 100,
            initRange / Vars.tilesize,
            maxRange / Vars.tilesize,
            maxRangeDmg
        );
        if (this.skillDefinitions != null) {
            this.skillDefinitions.forEach(def -> def.load(this));
        }
    }

    @Override
    public void init() {
        super.init();

        skillDefinitions = Seq.with(

            // num1: absorbed damage, num2: activi state, num3: health snapshot for ai dps check, num4:
            new SkillDefinition("damage-deflection") {
                {
                    this.range = 20;
                    this.icon = Lib.loadRegion("damage-deflection");
                    this.directive = false;
                    this.exclusive = false;
                    this.activeTime = CollapseUnitType.this.activeTime;
                    this.cooldown = CollapseUnitType.this.cooldown;
                    this.aiCheckInterval = 30;
                }

                @Override
                public void aiCheck(SkillStatus skill, SkilledUnit unit) {
                    var dps = 600;
                    var healthDanger = dps * this.aiCheckInterval / 60;
                    var enemyRange = maxRange;
                    if (skill.numValue3 > 0
                        && skill.numValue3 - unit.health() > healthDanger
                        && null != Units.bestTarget(unit.team(), unit.x(), unit.y(), enemyRange + 16,
                        (e -> !e.dead), (b -> true), UnitSorts.closest)
                    ) {
                        unit.tryActiveSkill(this.getSkillId(), () -> "");
                        skill.numValue3 = 0;
                        return;
                    }
                    skill.numValue3 = unit.health();
                }

                @Override
                public void active(SkillStatus status, SkilledUnit unit, Object data) {
                    Fx.heal.at(unit.x(), unit.y());
                    status.numValue1 = 0;
                    status.numValue2 = 0;
                    status.numValue4 = 0;
                }

                @Override
                public void preUpdate(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {
                    status.numValue2 = Mathf.lerpDelta(status.numValue2, 0, 1 / 10F);
                    status.numValue4 = Mathf.lerpDelta(status.numValue4, calculateRangeByDmg(status.numValue1), 0.2F);
                }

                @Override
                public void postUpdate(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {
                    if (isLastFrame && unit != null && !unit.dead()) {
                        if (status.numValue1 > (maxRangeDmg - rangeUpDmg) * 0.25 + rangeUpDmg) {
                            Fx.dynamicExplosion.at(unit.x(), unit.y(), calculateRangeByDmg(status.numValue1) / 8 / 2);
                        } else {
                            Fx.bigShockwave.at(unit.x(), unit.y());
                        }
                        Sounds.explosionbig.at(unit.x(), unit.y());
                        Damage.damage(unit.team(), unit.x(), unit.y(), calculateRangeByDmg(status.numValue1) * 1.1F,
                            status.numValue1 * damageDeflection);
                    }
                }

                @Override
                public void draw(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {
                    Draw.z(Layer.shields + 1);

                    var radius = status.numValue4;
                    var danger = status.numValue1 / maxRangeDmg;
                    var color = DsColors.dimensionShardColorLight.cpy().lerp(Color.red, danger);
                    Draw.color(color, Color.white, status.numValue2 * (1 - danger * 0.5F));
                    Draw.alpha(0.3F);
                    Fill.circle(unit.x(), unit.y(), radius);
                }

                @Override
                public float updateDamage(SkillStatus status, SkilledUnit unit, float damage) {
                    status.numValue1 += damage;
                    status.numValue2 = 1;
                    return damage * (1 - damageDeflection);
                }
            }
        );
    }


    @Override
    public Seq<SkillDefinition> getSkillDefinitions() {
        return skillDefinitions;
    }
}
