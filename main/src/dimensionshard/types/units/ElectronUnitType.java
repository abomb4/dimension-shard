package dimensionshard.types.units;

import arc.Core;
import arc.struct.Seq;
import dimensionshard.DsStatusEffects;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.DirectiveSkillData;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import dimensionshard.libs.skill.units.SkilledUnitEntity;
import mindustry.ai.types.BuilderAI;
import mindustry.content.Fx;
import mindustry.entities.bullet.BasicBulletType;
import mindustry.gen.Sounds;
import mindustry.type.StatusEffect;
import mindustry.type.UnitType;
import mindustry.type.Weapon;

/**
 * 核心小飞机
 *
 * @author abomb4 2022-11-30 15:07:04
 */
public class ElectronUnitType extends UnitType implements SkilledUnitType {

    public float activeTime = 60 * 8f;
    public float cooldown = 60 * 14F;
    public StatusEffect statusEffect = DsStatusEffects.hyper1;

    public Seq<SkillDefinition> skillDefinitions;

    public ElectronUnitType(String name) {
        super(name);
        this.constructor = SkilledUnitEntity::new;
        this.aiController = BuilderAI::new;
        coreUnitDock = true;
        flying = true;
        lowAltitude = true;
        mineSpeed = 8;
        mineTier = 2;
        buildSpeed = 1;
        drag = 0.05F;
        speed = 3.25F;
        rotateSpeed = 17;
        accel = 0.11F;
        itemCapacity = 70;
        health = 210;
        engineOffset = 6;
        hitSize = 11;

        weapons.add(new Weapon() {{
            top = false;
            reload = 24;
            x = 0;
            y = 2;
            shoot.shots = 3;
            shoot.shotDelay = 4;
            inaccuracy = 0.1F;
            ejectEffect = Fx.casing1;
            mirror = false;
            rotate = false;
            shootSound = Sounds.pew;
            bullet = new BasicBulletType(4, 11) {{
                width = 7;
                height = 11;
                lifetime = 62;
                shootEffect = Fx.shootSmall;
                smokeEffect = Fx.shootSmallSmoke;
                buildingDamageMultiplier = 0.01F;
            }};
        }});
    }

    @Override
    public void load() {
        super.load();
        this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description",
            cooldown / 60,
            activeTime / 60,
            statusEffect.damage * 60,
            statusEffect.speedMultiplier * 100,
            statusEffect.buildSpeedMultiplier * 100,      // atk
            statusEffect.buildSpeedMultiplier * 100,      // mining
            statusEffect.buildSpeedMultiplier * 100      // build
        );

        skillDefinitions = Seq.with(
            new SkillDefinition("hyperspeed-1") {
                {
                    icon = Lib.loadRegion("hyperspeed-1");
                    directive = false;
                    exclusive = true;
                    activeTime = ElectronUnitType.this.activeTime;
                    cooldown = ElectronUnitType.this.cooldown;
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
            }
        );
    }


    @Override
    public Seq<SkillDefinition> getSkillDefinitions() {
        return skillDefinitions;
    }
}
