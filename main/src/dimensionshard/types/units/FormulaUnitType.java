package dimensionshard.types.units;

import arc.Core;
import arc.audio.Sound;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.graphics.g2d.TextureRegion;
import arc.math.Interp;
import arc.math.Mathf;
import arc.math.geom.Vec2;
import arc.struct.Seq;
import arc.util.Time;
import arc.util.Tmp;
import dimensionshard.DsFx;
import dimensionshard.DsItems;
import dimensionshard.DsStatusEffects;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import dimensionshard.libs.skill.units.SkilledPayloadUnit;
import dimensionshard.types.bullets.SurroundingElectricBallBulletType;
import mindustry.Vars;
import mindustry.ai.types.BuilderAI;
import mindustry.audio.SoundLoop;
import mindustry.content.Fx;
import mindustry.entities.Effect;
import mindustry.entities.abilities.SuppressionFieldAbility;
import mindustry.entities.pattern.ShootSpread;
import mindustry.gen.Sounds;
import mindustry.gen.Unit;
import mindustry.graphics.Drawf;
import mindustry.graphics.Layer;
import mindustry.type.UnitType;
import mindustry.type.Weapon;
import mindustry.type.ammo.PowerAmmoType;
import mindustry.world.meta.BlockFlag;

/**
 * T4 辅助飞行器 - 公式
 *
 * @author abomb4 2022-11-15 23:43:15
 */
public class FormulaUnitType extends UnitType implements SkilledUnitType {

    /** 喷气技能时间 */
    public float ionJetDuration = 10 * 60f;
    /** 喷气技能冷却 */
    public float ionJetCooldown = 10 * 60f;
    /** 最高速度 */
    public float ionJetMaxSpeed = 16f;
    /** 推力加速度 */
    public float ionJetAccel = 0.042f;

    public Seq<SkillDefinition> skillDefinitions;

    public FormulaUnitType() {
        this("formula");
    }

    public FormulaUnitType(String name) {
        super(name);
        constructor = SkilledPayloadUnit::new;
        aiController = BuilderAI::new;
        mineWalls = true;
        armor = 10;
        health = 5000;
        speed = 2.2F;
        rotateSpeed = 2.3F;
        accel = 0.12F;
        drag = 0.03F;
        flying = true;
        engineOffset = 15;
        engineSize = 0;
        buildSpeed = 3.7F;
        itemCapacity = 150;
        mineTier = 4;
        mineSpeed = 10;
        faceTarget = false;
        hitSize = 32;
        lowAltitude = true;
        // itemOffsetY = -5;
        payloadCapacity = (3.5f * 3.5f) * Vars.tilePayload;
        targetFlags = new BlockFlag[]{BlockFlag.battery, BlockFlag.factory, null};
        ammoType = new PowerAmmoType(3000);

        final Effect fxCharge = DsFx.formulaCharge;
        weapons.add(new Weapon(Lib.modName + "formula-weapon") {{
            shake = 4;
            shoot = new ShootSpread(8, 180 / 8f);
            shoot.shotDelay = 0;
            shoot.firstShotDelay = fxCharge.lifetime - 1;
            inaccuracy = 0;
            shootX = 0;
            shootY = 0;
            recoil = 0;
            x = 0;
            y = -5.2F;
            mirror = false;
            reload = 10 * 60 - 1;
            shootSound = Sounds.shootBig;
            shootCone = 360;
            rotate = false;
            bullet = new SurroundingElectricBallBulletType() {{
                lightningColor = DsItems.ionLiquid.color;
                frontColor = DsItems.ionLiquid.color;
                shootEffect = Fx.none;
                chargeEffect = fxCharge;
                status = DsStatusEffects.ionBurningEffect;
                statusDuration = 60;
                lifetime = 5 * 60;
            }};
        }});

        abilities.add(new SuppressionFieldAbility() {{
            color = DsItems.ionLiquid.color;
            orbRadius = 4;
            particleSize = 3;
            y = -5.2F;
            particles = 10;
            display = active = false;
            layer = Layer.effect;
        }});

        setEnginesMirror(
            new UnitEngine(16f, -19.0f, 7f, 330f)
        );
    }

    @Override
    public void load() {
        super.load();
        this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description",
            ionJetCooldown / 60F,
            ionJetDuration / 60F,
            ionJetMaxSpeed * 60 / Vars.tilesize
        );
        if (this.skillDefinitions != null) {
            this.skillDefinitions.forEach(def -> def.load(this));
        }
    }

    @Override
    public void init() {
        super.init();

        skillDefinitions = Seq.with(
            new SkillDefinition("ion-jet") {
                final Vec2 tmp = new Vec2();
                TextureRegion closeIcon;
                Sound activateSound;
                SoundLoop sound;

                {
                    directive = false;
                    exclusive = true;
                    activeTime = ionJetDuration;
                    cooldown = ionJetCooldown;
                }

                @Override
                public void load(UnitType unitType) {
                    super.load(unitType);
                    closeIcon = Lib.loadRegion(this.name + "-close");
                    activateSound = Lib.loadSound(this.name + "-activate");
                    sound = new SoundLoop(Sounds.torch, 1);
                }

                @Override
                public TextureRegion getIcon(SkillStatus skill) {
                    if (skill.active && skill.activeTimeLeft > 0) {
                        return closeIcon;
                    }
                    return icon;
                }

                @Override
                public void aiCheck(SkillStatus status, SkilledUnit unit) {
                    super.aiCheck(status, unit);
                }

                @Override
                public void draw(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {
                    float fin = (activeTime - status.activeTimeLeft) / activeTime;
                    float backRotation = unit.rotation() - 180;
                    float centerX = unit.x();
                    float centerY = unit.y();

                    float lightStroke = 40f;
                    Color[] colors = {
                        Color.valueOf("8b7abe").a(0.55f),
                        Color.valueOf("9189f5").a(0.7f),
                        Color.valueOf("807ef7").a(0.8f),
                        Color.valueOf("91a4ff"),
                        Color.white.cpy()
                    };
                    Interp lengthInterp = Interp.slope;

                    float width = 5.7f, oscScl = 1.2f, oscMag = 0.02f;
                    float mult = lengthInterp.apply(fin);
                    float realLength = 120f;
                    int divisions = 25;
                    float sin = Mathf.sin(Time.time, oscScl, oscMag);
                    Color flareColor = Color.valueOf("9189f5");
                    float flareWidth = 3f,
                        flareInnerScl = 0.5f,
                        flareLength = 40f,
                        flareInnerLenScl = 0.5f,
                        flareLayer = Layer.bullet - 0.0001f,
                        flareRotSpeed = 1.2f;

                    float[] lengthWidthPans = {
                        1.12f, 1.3f, 0.32f,
                        1f, 1f, 0.3f,
                        0.8f, 0.9f, 0.2f,
                        0.5f, 0.8f, 0.15f,
                        0.25f, 0.7f, 0.1f,
                    };

                    float xx = 15;
                    float yy = -17;
                    float rotUp = unit.rotation() - 90;
                    for (int j = -1; j <= 1; j += 2) {
                        Draw.z(Layer.effect);
                        Tmp.v2.set(xx * j, yy).rotate(rotUp);
                        float x = centerX + Tmp.v2.x;
                        float y = centerY + Tmp.v2.y;

                        for (int i = 0; i < colors.length; i++) {
                            Draw.color(colors[i].write(Tmp.c1).mul(0.9f).mul(1f + Mathf.absin(Time.time, 1f, 0.1f)));
                            Drawf.flame(x, y, divisions, backRotation,
                                realLength * lengthWidthPans[i * 3] * (1f - sin),
                                width * lengthWidthPans[i * 3 + 1] * mult * (1f + sin),
                                lengthWidthPans[i * 3 + 2]
                            );
                        }

                        Draw.color(flareColor);
                        Draw.z(flareLayer);

                        float angle = Time.time * flareRotSpeed + backRotation;

                        for (int i = 0; i < 4; i++) {
                            Drawf.tri(x, y, flareWidth, flareLength * (mult + sin), i * 90 + 45 + angle);
                        }

                        Draw.color();
                        for (int i = 0; i < 4; i++) {
                            Drawf.tri(x, y,
                                flareWidth * flareInnerScl,
                                flareLength * flareInnerLenScl * (mult + sin),
                                i * 90 + 45 + angle);
                        }

                        Tmp.v1.trns(backRotation, realLength * 1.1f);
                        Drawf.light(x, y, x + Tmp.v1.x, y + Tmp.v1.y, lightStroke, lightColor, 0.7f);
                        Draw.reset();
                    }
                }

                @Override
                public boolean canActiveAgain(SkillStatus status, SkilledUnit unit) {
                    return true;
                }

                @Override
                public void active(SkillStatus status, SkilledUnit unit, Object data) {
                    status.numValue1 = unit.rotation();
                    activateSound.at(unit.x(), unit.y(), Mathf.random(0.9f, 1.1f));
                }

                @Override
                public void activeAgain(SkillStatus status, SkilledUnit unit, Object data) {
                    status.activeTimeLeft = Math.min(30f, status.activeTimeLeft);
                }

                @Override
                public void postUpdate(SkillStatus status, SkilledUnit unit, boolean isLastFrame) {
                    float sin = Math.min(1, status.activeTimeLeft / activeTime / 0.1f);

                    float nowRotation = unit.rotation();
                    tmp.trns(status.numValue1, ionJetMaxSpeed);
                    unit.moveAt(tmp, ionJetAccel * sin);

                    status.numValue1 = nowRotation;

                    if (!Vars.headless && sound != null) {
                        tmp.trns(nowRotation - 180, 40).add(unit.x(), unit.y());
                        sound.update(tmp.x, tmp.y, true, sin);
                    }
                }
            }
        );
    }

    @Override
    public void drawItems(Unit unit) {
        final float z = Draw.z();
        Draw.z(Layer.effect + 2);
        super.drawItems(unit);
        Draw.z(z);
    }

    @Override
    public Seq<SkillDefinition> getSkillDefinitions() {
        return skillDefinitions;
    }
}
