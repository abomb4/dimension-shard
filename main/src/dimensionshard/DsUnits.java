package dimensionshard;

import arc.Events;
import arc.math.Mathf;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.units.SkilledMechUnit;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import dimensionshard.types.bullets.SurroundingElectricBallBulletType;
import dimensionshard.types.units.CollapseUnitType;
import dimensionshard.types.units.ElectronUnitType;
import dimensionshard.types.units.EquaUnitType;
import dimensionshard.types.units.LightningUnitType;
import dimensionshard.types.units.RhapsodyUnitType;
import mindustry.Vars;
import mindustry.ai.types.BuilderAI;
import mindustry.content.Fx;
import mindustry.entities.Effect;
import mindustry.entities.Fires;
import mindustry.entities.Lightning;
import mindustry.entities.Puddles;
import mindustry.entities.abilities.SuppressionFieldAbility;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.entities.pattern.ShootSpread;
import mindustry.entities.units.WeaponMount;
import mindustry.game.EventType;
import mindustry.game.Team;
import mindustry.gen.Sounds;
import mindustry.gen.Unit;
import mindustry.type.UnitType;
import mindustry.type.Weapon;
import mindustry.type.ammo.ItemAmmoType;
import mindustry.type.ammo.PowerAmmoType;
import mindustry.world.meta.BlockFlag;

/**
 * 单位
 *
 * @author abomb4 2022-11-15 22:53:08
 */
public final class DsUnits {

    /** 灼烧 Attack aircraft T4 */
    public static UnitType burn;

    /** 崩坏 Attack aircraft T5 */
    public static UnitType collapse;

    /** 公式 Support artifact T4 */
    public static UnitType formula;

    /** 方程 Support artifact T5 */
    public static UnitType equa;

    /** 节拍 Attack Mech T4 */
    public static UnitType beat;

    /** 狂想曲 Attack Mech T5 */
    public static UnitType rhapsody;

    /** 电电 */
    public static UnitType electron;

    /** 雷雷 */
    public static UnitType lightning;

    /** load all */
    public static void load() {
        burn = new UnitType("burn") {{
            armor = 8;
            health = 6400;
            speed = 0.75F;
            rotateSpeed = 2;
            accel = 0.04F;
            drag = 0.04F;
            flying = true;
            engineOffset = 28;
            engineSize = 7.8F;
            // rotateShooting = false;
            hitSize = 54;
            lowAltitude = true;
            targetFlags = new BlockFlag[]{BlockFlag.generator, BlockFlag.core, null};
            // destructibleWreck = false;
            circleTarget = true;
            faceTarget = false;
            ammoType = new ItemAmmoType(DsItems.dimensionShard);

            constructor = SkilledUnitEntity::new;

            weapons.add(new Weapon(Lib.modName + "-burn-ion-cannon") {{
                shake = 4;
                shootY = 9;
                shoot.shots = 3;
                shoot.shotDelay = 4;
                x = 15;
                y = 6;
                rotateSpeed = 4;
                reload = 50;
                recoil = 4;
                shootSound = Lib.loadSound("ion-shot");
                shadow = 20;
                rotate = true;
                bullet = DsBullets.standardIonBolt1;
            }});
            var puddles = 36;
            var puddleRange = 24;
            var puddleAmount = 16;
            var puddleLiquid = DsItems.ionLiquid;
            var lightning = 12;
            var lightningDamage = 20;
            var lightningLength = 24;
            var lightningLengthRand = 8;
            Events.on(EventType.UnitDestroyEvent.class, (event -> {
                if (event.unit.type == burn) {
                    // Ion Liquid leak, and flame
                    var x = event.unit.x;
                    var y = event.unit.y;
                    for (var i = 0; i < puddles; i++) {
                        var tile = Vars.world.tileWorld(x + Mathf.range(puddleRange), y + Mathf.range(puddleRange));
                        Puddles.deposit(tile, puddleLiquid, puddleAmount);
                        if (i < 3) {
                            Fires.create(tile);
                        }
                    }
                    // Lightning hit everyone
                    for (var i = 0; i < lightning; i++) {
                        Lightning.create(Team.derelict, DsItems.ionLiquid.color, lightningDamage, x, y,
                            Mathf.random(360), lightningLength + Mathf.random(lightningLengthRand));
                    }
                }
            }));

        }};

        collapse = new CollapseUnitType();

        formula = new UnitType("formula") {{
            constructor = SkilledUnitEntity::new;
            aiController = BuilderAI::new;
            mineWalls = true;
            armor = 10;
            health = 5000;
            speed = 2.5F;
            rotateSpeed = 2.2F;
            accel = 0.06F;
            drag = 0.04F;
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
            payloadCapacity = (3 * 3) * Vars.tilePayload;
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
            }});

            setEnginesMirror(
                new UnitEngine(16f, -19.0f, 7f, 330f)
            );
        }};

        equa = new EquaUnitType();

        beat = new UnitType("beat") {{
            constructor = SkilledMechUnit::new;
            armor = 9;
            health = 8000;
            speed = 0.35F;
            rotateSpeed = 2;
            flying = false;
            faceTarget = true;
            hitSize = 20;
            canDrown = false;
            mechFrontSway = 1;
            mechStepParticles = true;
            stepShake = 0.15F;
            singleTarget = true;
            ammoType = new ItemAmmoType(DsItems.hardThoriumAlloy);

            weapons.add(new Weapon(Lib.modName + "-beat-weapon") {
                {
                    top = false;
                    shake = 3;
                    shoot.shots = 8;
                    shoot.shotDelay = 0.5F;
                    inaccuracy = 0;
                    shootY = 9;
                    x = 17;
                    y = 0;
                    rotateSpeed = 4;
                    reload = 15.5F;
                    recoil = 2;
                    shootSound = Sounds.none;
                    shadow = 0;
                    rotate = false;
                    bullet = new BasicBulletType(7, 29) {{
                        lifetime = 28;
                        ammoMultiplier = 4;
                        width = 10F;
                        height = 26F;
                        pierceBuilding = false;
                    }};
                }

                @Override
                protected void shoot(Unit unit, WeaponMount mount, float shootX, float shootY, float rotation) {
                    super.shoot(unit, mount, shootX, shootY, rotation);
                    Sounds.shootBig.at(shootX, shootY, Mathf.random(soundPitchMin, soundPitchMax));
                }
            });
        }};

        rhapsody = new RhapsodyUnitType("rhapsody");
        electron = new ElectronUnitType("electron");
        lightning = new LightningUnitType("lightning");
    }

    private DsUnits() {
    }
}
