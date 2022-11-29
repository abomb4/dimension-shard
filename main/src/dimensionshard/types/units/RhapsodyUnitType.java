package dimensionshard.types.units;

import arc.Core;
import arc.audio.Sound;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Angles;
import arc.math.geom.Position;
import arc.struct.Seq;
import arc.util.Tmp;
import dimensionshard.DsColors;
import dimensionshard.DsItems;
import dimensionshard.DsStatusEffects;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.DirectiveSkillData;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import dimensionshard.libs.skill.units.SkilledMechUnit;
import dimensionshard.types.bullets.ElectricStormBulletType;
import dimensionshard.types.bullets.IonBoltBulletType;
import dimensionshard.types.bullets.IonLaserBulletType;
import mindustry.Vars;
import mindustry.content.StatusEffects;
import mindustry.entities.Effect;
import mindustry.entities.UnitSorts;
import mindustry.entities.Units;
import mindustry.entities.bullet.LaserBulletType;
import mindustry.gen.Sounds;
import mindustry.gen.Unit;
import mindustry.graphics.Layer;
import mindustry.type.UnitType;
import mindustry.type.Weapon;

/**
 * 狂想曲机甲
 *
 * @author abomb4 2022-11-24 16:35:37
 */
public class RhapsodyUnitType extends UnitType implements SkilledUnitType {

    /** 白色粗激光 */
    public static final IonLaserBulletType largeIonLaser = new IonLaserBulletType();

    /** 充能特效 */
    public static final Effect fxIonLaserCharge = new Effect(60 * 3, 100, e -> {
        Position data = (Position) e.data;
        var x = data.getX();
        var y = data.getY();
        Draw.color(DsItems.ionLiquid.color);
        Lines.stroke(e.fin() * 2);
        Lines.circle(x, y, 4 + e.fout() * 100);

        Fill.circle(x, y, e.fin() * 20);

        Angles.randLenVectors(e.id, 20, 40 * e.fout(), (xx, yy) -> {
            Fill.circle(x + xx, y + yy, e.fin() * 5);
        });

        Draw.color();
        Fill.circle(x, y, e.fin() * 10);
    });

    /** 技能 */
    public float skillY = 10;
    /** 充能声音 */
    public Sound chargeSound;
    /** 充能效果 */
    public Effect chargeEffect;
    /** 技能射击声音 */
    public Sound shootSound;
    /** 技能激光类型 */
    public LaserBulletType laserBullet;
    /** 技能冷却 */
    public float cooldown;
    /** 发射震动 */
    public float laserShake;
    /** 充能延迟时间 */
    public float chargeTime;

    /** 技能定义 */
    public Seq<SkillDefinition> skillDefinitions;

    public RhapsodyUnitType(String name) {
        super(name);
        this.constructor = SkilledMechUnit::new;
        this.chargeSound = Sounds.lasercharge;
        this.chargeEffect = fxIonLaserCharge;
        this.shootSound = Sounds.laserblast;
        this.laserBullet = largeIonLaser;
        this.cooldown = 60 * 12F;
        this.chargeTime = 60 * 3F;
        this.laserShake = 14F;

        armor = 16;
        health = 18000;
        speed = 0.35F;
        rotateSpeed = 1.8F;
        flying = false;
        faceTarget = true;
        hitSize = 26;
        // destructibleWreck = false;
        canDrown = false;
        mechFrontSway = 1.5F;
        mechSideSway = 0.6F;
        mechStepParticles = true;
        stepShake = 0.75F;
        singleTarget = true;
        immunities.add(DsStatusEffects.ionBurningEffect);
        immunities.add(StatusEffects.burning);

        weapons.add(new Weapon(Lib.modName + "-rhapsody-weapon") {{
            mirror = false;
            shake = 2;
            shoot.shots = 3;
            shoot.shotDelay = 6;
            inaccuracy = 0;
            shootX = 0;
            shootY = 29;
            x = 16;
            y = 3;
            rotateSpeed = 4;
            reload = 60;
            recoil = 2;
            shootSound = Sounds.none;
            shadow = 0;
            rotate = false;
            shootSound = Lib.loadSound("ion-shot");
            bullet = new IonBoltBulletType() {{
                fragBullet = new ElectricStormBulletType() {{
                    lifetime = 18;
                    speedStart = 2.5F;
                    damage = 1;
                    pierceCap = 2;
                    splashDamage = 1;
                    splashDamageRadius = 24;
                    lightning = 1;
                    lightningLength = 3;
                    lightningDamage = 26;
                    lightningColor = DsItems.ionLiquid.color;
                    frontColor = DsItems.ionLiquid.color;
                    flyingLightningDamage = 18;
                    flyingLightningColor = DsItems.ionLiquid.color;
                    flyingLightningChange = 0.07F;
                }};
                damage = 50;
                splashDamage = 60;
                lightning = 1;
                fragLifeMax = 0.8F;
                width = 3;
            }};
        }});
    }

    @Override
    public void load() {
        super.load();
        this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description",
            cooldown / 60,
            chargeTime / 60,
            laserBullet.damage,
            range / Vars.tilesize,
            laserBullet.lightningDamage,
            laserBullet.statusDuration / 60
        );

        this.skillDefinitions = Seq.with(new SkillDefinition("ion-laser-large") {
            {
                range = (int) RhapsodyUnitType.this.laserBullet.range;
                icon = Lib.loadRegion("ion-laser-large");
                directive = true;
                exclusive = true;
                activeTime = RhapsodyUnitType.this.chargeTime;
                cooldown = RhapsodyUnitType.this.cooldown;
            }

            @Override
            public void aiCheck(SkillStatus status, SkilledUnit skilledUnit) {
                final Unit unit = (Unit) skilledUnit;
                var target = Units.bestTarget(unit.team(), unit.x(), unit.y(), laserBullet.length - 10,
                    (e -> !e.dead), (b -> true), UnitSorts.closest);
                if (target != null) {
                    var bullet = weapons.get(0).bullet;
                    var range = bullet.lifetime * bullet.speed;
                    if (unit.dst(target) > range) {
                        skilledUnit.tryActiveSkill(this.getSkillId(),
                            new DirectiveSkillData(target.x(), target.y()));
                    }
                }
            }

            @Override
            public void active(SkillStatus status, SkilledUnit skilledUnit, Object dataObj) {
                final Unit unit = (Unit) skilledUnit;
                DirectiveSkillData data = (DirectiveSkillData) dataObj;
                Position pos = new Position() {
                    final Weapon weapon = weapons.get(0);

                    @Override
                    public float getX() {
                        float mountX = unit.x() + Angles.trnsx(unit.rotation() - 90, weapon.x, weapon.y);
                        return mountX + Angles.trnsx(unit.rotation() - 90, weapon.shootX, weapon.shootY + skillY);
                    }

                    @Override
                    public float getY() {
                        float mountY = unit.y() + Angles.trnsy(unit.rotation() - 90, weapon.x, weapon.y);
                        return mountY + Angles.trnsy(unit.rotation() - 90, weapon.shootX, weapon.shootY + skillY);
                    }
                };
                final float sx = pos.getX();
                final float sy = pos.getY();
                chargeEffect.at(sx, sy, 0, pos);
                chargeSound.at(sx, sy, 80 / (60 * 3F));
                status.numValue1 = data.x;
                status.numValue2 = data.y;
                // todo Try active skill of nearby same type units
            }

            @Override
            public void preUpdate(SkillStatus status, SkilledUnit skilledUnit, boolean isLastFrame) {
                final Unit unit = (Unit) skilledUnit;
                unit.vel().setZero();
                status.numValue3 = unit.rotation();
                // let ang = Tmp.v1.set(unit.x, unit.y).angleTo(skill.numValue1, skill.numValue2);
                // unit.lookAt(ang);
                for (var mount : unit.mounts()) {
                    mount.reload = 100;
                }
            }

            @Override
            public void postUpdate(SkillStatus status, SkilledUnit skilledUnit, boolean isLastFrame) {
                final Unit unit = (Unit) skilledUnit;
                var ang = Tmp.v1.set(unit.x(), unit.y()).angleTo(status.numValue1, status.numValue2);
                unit.rotation = status.numValue3;
                unit.lookAt(ang);
                if (isLastFrame) {
                    var weapon = unit.mounts[0].weapon;
                    var mountX = unit.x + Angles.trnsx(unit.rotation - 90, weapon.x, weapon.y);
                    var mountY = unit.y + Angles.trnsy(unit.rotation - 90, weapon.x, weapon.y);
                    var shootX = mountX + Angles.trnsx(unit.rotation - 90, weapon.shootX, weapon.shootY + skillY);
                    var shootY = mountY + Angles.trnsy(unit.rotation - 90, weapon.shootX, weapon.shootY + skillY);
                    var angle = Tmp.v1.set(shootX, shootY).angleTo(status.numValue1, status.numValue2);
                    laserBullet.create(unit, unit.team, shootX, shootY, angle);
                    Effect.shake(laserShake, laserShake, shootX, shootY);
                    for (var mount : unit.mounts) {
                        mount.reload = weapon.reload;
                    }
                    shootSound.at(shootX, shootY, 0.7F);
                }
            }

            @Override
            public void draw(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {
                Draw.z(Layer.shields);

                var radius = 50 * Math.min((status.def.activeTime - status.activeTimeLeft) / 8, 1);
                var danger = status.numValue1 / 4000;
                var color = DsColors.dimensionShardColorLight.cpy().lerp(Color.red, danger);
                Draw.color(color, Color.white, status.numValue2 * (1 - danger * 0.5F));
            }

            @Override
            public float updateDamage(SkillStatus status, SkilledUnit unit, float damage) {
                return damage * 1.2F;
            }
        });
    }

    @Override
    public Seq<SkillDefinition> getSkillDefinitions() {
        return skillDefinitions;
    }
}
