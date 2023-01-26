package dimensionshard.types.units;

import arc.Core;
import arc.audio.Sound;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.Fill;
import arc.graphics.g2d.Lines;
import arc.math.Angles;
import arc.math.Mathf;
import arc.struct.Seq;
import arc.util.Tmp;
import dimensionshard.DsStatusEffects;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.DirectiveSkillData;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import mindustry.Vars;
import mindustry.ai.types.BuilderAI;
import mindustry.content.Fx;
import mindustry.content.StatusEffects;
import mindustry.entities.Damage;
import mindustry.entities.Effect;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.entities.bullet.BulletType;
import mindustry.entities.bullet.LaserBulletType;
import mindustry.entities.pattern.ShootSpread;
import mindustry.gen.Sounds;
import mindustry.gen.Unit;
import mindustry.graphics.Drawf;
import mindustry.type.StatusEffect;
import mindustry.type.UnitType;
import mindustry.type.Weapon;

/**
 * 核心大飞机
 *
 * @author abomb4 2022-11-30 15:07:04
 */
public class LightningUnitType extends UnitType implements SkilledUnitType {

    public static final Color LIGHT_COLOR = Color.valueOf("69dcee");

    public float activeTime1 = 60 * 8f;
    public float cooldown1 = 60 * 14F;

    public int range2 = 26 * Vars.tilesize;
    public float cooldown2 = 60 * 8;
    public float damage2 = 125;

    public StatusEffect statusEffect = DsStatusEffects.hyper2;

    public Effect fxHitBulletSmall = new Effect(14, (e -> {
        Draw.color(Color.white, LIGHT_COLOR, e.fin());

        e.scaled(7, (s -> {
            Lines.stroke(0.5F + s.fout());
            Lines.circle(e.x, e.y, s.fin() * 5);
        }));

        Lines.stroke(0.5F + e.fout());

        Angles.randLenVectors(e.id, 5, e.fin() * 15, ((x, y) -> {
            var ang = Mathf.angle(x, y);
            Lines.lineAngle(e.x + x, e.y + y, ang, e.fout() * 3 + 1);
        }));
    }));

    public Seq<SkillDefinition> skillDefinitions;

    public LightningUnitType(String name) {
        super(name);
        this.constructor = SkilledUnitEntity::new;
        this.aiController = BuilderAI::new;
        coreUnitDock = true;
        flying = true;
        lowAltitude = true;
        mineSpeed = 10;
        mineTier = 3;
        buildSpeed = 1.4F;
        drag = 0.05F;
        speed = 3.55F;
        armor = 2;
        rotateSpeed = 17;
        accel = 0.11F;
        itemCapacity = 100;
        health = 325;
        engineOffset = 8;
        engineSize = 4;
        hitSize = 15;
        payloadCapacity = (2 * 2) * Vars.tilePayload;

        weapons.add(new Weapon() {{
            top = false;
            reload = 24;
            x = 0;
            y = 2;
            shoot = new ShootSpread(3, 1);
            shoot.shotDelay = 4;
            inaccuracy = 0.1F;
            ejectEffect = Fx.casing1;
            mirror = false;
            rotate = false;
            shootSound = Sounds.pew;
            bullet = new BasicBulletType(5, 12) {{
                keepVelocity = false;
                width = 7;
                height = 11;
                lifetime = 50;
                homingRange = 4 * 8;
                homingPower = 0.16F;
                backColor = LIGHT_COLOR;
                hitEffect = fxHitBulletSmall;
                despawnEffect = fxHitBulletSmall;
                lightning = 1;
                lightningLength = 2;
                lightningLengthRand = 8;
                lightningColor = LIGHT_COLOR;
                lightningDamage = 6;
                lightningType = new BulletType(0.0001F, 0) {{
                    lifetime = Fx.lightning.lifetime;
                    hitEffect = Fx.hitLancer;
                    despawnEffect = Fx.none;
                    status = StatusEffects.shocked;
                    statusDuration = 10;
                    hittable = false;
                    buildingDamageMultiplier = 0.05F;
                }};
                shootEffect = Fx.shootSmall;
                smokeEffect = Fx.shootSmallSmoke;
                buildingDamageMultiplier = 0.05F;
            }};
        }});
    }

    @Override
    public void load() {
        super.load();
        this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description",
            cooldown1 / 60,
            activeTime1 / 60,
            statusEffect.damage * 60,
            statusEffect.speedMultiplier * 100,
            statusEffect.buildSpeedMultiplier * 100,      // atk
            statusEffect.buildSpeedMultiplier * 100,      // mining
            statusEffect.buildSpeedMultiplier * 100,      // build
            cooldown2 / 60,
            range2 / Vars.tilesize,
            damage2
        );

        skillDefinitions = Seq.with(
            new SkillDefinition("hyperspeed-2") {
                {
                    icon = Lib.loadRegion("hyperspeed-2");
                    directive = false;
                    exclusive = true;
                    activeTime = LightningUnitType.this.activeTime1;
                    cooldown = LightningUnitType.this.cooldown1;
                }

                @Override
                public void aiCheck(SkillStatus status, SkilledUnit unit) {
                    // If build a block that needs 5s build time, activate
                    if (unit.isBuilding() && unit.buildPlan() != null && unit.buildPlan().block.buildCost > 5 * 60) {
                        unit.tryActiveSkill(status.def.getSkillId(), new DirectiveSkillData(0, 0));
                    }
                }

                @Override
                public void active(SkillStatus status, SkilledUnit unit, Object data) {
                    unit.apply(statusEffect, activeTime);
                    // Try active skill nearby units

                }
            },
            new SkillDefinition("flash") {
                {
                    icon = Lib.loadRegion("flash");
                    range = range2;
                    directive = true;
                    exclusive = true;
                    activeTime = -1;
                    cooldown = LightningUnitType.this.cooldown2;
                }

                final Color teleportColor = LIGHT_COLOR.cpy();

                final Effect teleportEffect = new Effect(20, 50, e -> {
                    Draw.color(teleportColor);
                    for (var i = 0; i < 4; i++) {
                        Drawf.tri(e.x, e.y, 6, 50 * e.fout(), i * 90);
                    }

                    Draw.color();
                    for (var i = 0; i < 4; i++) {
                        Drawf.tri(e.x, e.y, 3, 20 * e.fout(), i * 90);
                    }
                });

                final Sound teleportSound = Sounds.plasmaboom;

                final LaserBulletType teleportLaserType = new LaserBulletType(damage2) {{
                    colors = new Color[]{teleportColor.cpy().a(0.4f), teleportColor, Color.white};
                    hitEffect = Fx.hitLancer;
                    despawnEffect = Fx.none;
                    hitSize = 4;
                    lifetime = 16;
                    drawSize = 400;
                    length = 0;
                    buildingDamageMultiplier = 0.1F;
                    pierce = true;
                    pierceBuilding = true;
                }};

                final Effect teleportLaserEffect = new Effect(16, e -> {
                    final DirectiveSkillData data = (DirectiveSkillData) e.data;
                    var lengthFalloff = 0.5;
                    var width = teleportLaserType.width;
                    var sideWidth = teleportLaserType.sideWidth;
                    var sideLength = teleportLaserType.sideLength;
                    var sideAngle = teleportLaserType.sideAngle;
                    var targetX = data.x;
                    var targetY = data.y;
                    Tmp.v1.set(targetX, targetY).sub(e.x, e.y);
                    var angle = Tmp.v1.angle();
                    var baseLen = Tmp.v1.len();

                    var compound = 1;
                    var cwidth = teleportLaserType.width;
                    Lines.lineAngle(e.x, e.y, angle, baseLen);
                    for (var color : teleportLaserType.colors) {
                        Draw.color(color);
                        Lines.stroke((cwidth *= lengthFalloff) * e.fout());
                        Lines.lineAngle(e.x, e.y, angle, baseLen, false);
                        Tmp.v1.trns(angle, baseLen);
                        Drawf.tri(e.x + Tmp.v1.x, e.y + Tmp.v1.y, Lines.getStroke() * 1.22F, cwidth * 2 + width / 2,
                            angle);

                        Fill.circle(e.x, e.y, 1 * cwidth * e.fout());
                        for (var i : Mathf.signs) {
                            Drawf.tri(e.x, e.y, sideWidth * e.fout() * cwidth, sideLength * compound,
                                angle + sideAngle * i);
                        }

                        compound *= lengthFalloff;
                    }
                    Draw.reset();
                });

                @Override
                public void active(SkillStatus status, SkilledUnit skilledUnit, Object obj) {
                    DirectiveSkillData data = (DirectiveSkillData) obj;
                    Unit unit = (Unit) skilledUnit;
                    var x = unit.x;
                    var y = unit.y;
                    teleportEffect.at(unit.x, unit.y);
                    teleportSound.at(unit.x, unit.y, Mathf.random(0.9F, 1.1F));
                    var targetX = data.x;
                    var targetY = data.y;
                    Tmp.v1.set(targetX, targetY).sub(unit.x, unit.y);
                    var angle = Tmp.v1.angle();
                    Tmp.v1.setLength(Math.min(status.def.range, Tmp.v1.len()));
                    var len = Tmp.v1.len();
                    unit.x += Tmp.v1.x;
                    unit.y += Tmp.v1.y;
                    unit.snapInterpolation();
                    teleportEffect.at(unit.x, unit.y);
                    teleportSound.at(unit.x, unit.y, Mathf.random(0.9F, 1.1F));
                    // teleportLaserType.create(unit, x, y, angle);
                    Damage.collideLine(teleportLaserType.create(unit, x, y, angle),
                        unit.team, Fx.hitLancer, x, y, angle,
                        len, false, false);
                    // draw using effect
                    teleportLaserEffect.at(x, y, 0, new DirectiveSkillData(unit.x, unit.y));
                    // Try active skill if serval Collapse under control

                }
            }
        );
    }


    @Override
    public Seq<SkillDefinition> getSkillDefinitions() {
        return skillDefinitions;
    }
}
