package dimensionshard;

import arc.Events;
import arc.math.Mathf;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.units.SkilledMechUnit;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import dimensionshard.types.units.CollapseUnitType;
import dimensionshard.types.units.ElectronUnitType;
import dimensionshard.types.units.EquaUnitType;
import dimensionshard.types.units.FormulaUnitType;
import dimensionshard.types.units.LightningUnitType;
import dimensionshard.types.units.RhapsodyUnitType;
import mindustry.Vars;
import mindustry.content.Blocks;
import mindustry.content.Items;
import mindustry.entities.Fires;
import mindustry.entities.Lightning;
import mindustry.entities.Puddles;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.entities.units.WeaponMount;
import mindustry.game.EventType;
import mindustry.game.Team;
import mindustry.gen.Sounds;
import mindustry.gen.Unit;
import mindustry.type.UnitType;
import mindustry.type.Weapon;
import mindustry.type.ammo.ItemAmmoType;
import mindustry.world.blocks.defense.turrets.ItemTurret;
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
            health = 6800;
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
            circleTarget = false;
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
                reload = 60;
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

        formula = new FormulaUnitType();

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
                    shoot.shots = 4;
                    shoot.shotDelay = 0.8F;
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
                    BasicBulletType salvoThorium = (BasicBulletType) ((ItemTurret) Blocks.salvo).ammoTypes.get(
                        Items.thorium);
                    bullet = new BasicBulletType(7, 44) {{
                        lifetime = 28;
                        ammoMultiplier = 4;
                        width = 10F;
                        height = 28F;
                        pierceBuilding = false;
                        frontColor = salvoThorium.frontColor.cpy().lerp(DsColors.hardThoriumAlloyColor, 0.5F);
                        backColor = salvoThorium.backColor.cpy().lerp(DsColors.hardThoriumAlloyColorLight, 0.5F);
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
