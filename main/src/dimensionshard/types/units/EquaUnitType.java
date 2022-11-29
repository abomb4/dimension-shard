package dimensionshard.types.units;

import arc.Core;
import arc.audio.Sound;
import arc.graphics.Color;
import arc.graphics.g2d.Draw;
import arc.math.Mathf;
import arc.struct.Seq;
import arc.util.Tmp;
import dimensionshard.libs.Lib;
import dimensionshard.libs.skill.DirectiveSkillData;
import dimensionshard.libs.skill.SkillDefinition;
import dimensionshard.libs.skill.SkillStatus;
import dimensionshard.libs.skill.SkilledUnit;
import dimensionshard.libs.skill.SkilledUnitType;
import dimensionshard.libs.skill.units.SkilledPayloadUnit;
import dimensionshard.types.abilities.DeflectForceFieldAbility;
import mindustry.Vars;
import mindustry.entities.Effect;
import mindustry.gen.Sounds;
import mindustry.graphics.Drawf;
import mindustry.type.UnitType;

/**
 * T5 支援飞行器 - 方程
 *
 * @author abomb4 2022-11-15 23:43:15
 */
public class EquaUnitType extends UnitType implements SkilledUnitType {

    /** teleport color */
    public static Color teleportColor = Color.valueOf("69dcee");

    /** teleport effect */
    public static Effect teleportEffect = new Effect(40, 100, e -> {
        Draw.color(teleportColor);
        for (var i = 0; i < 4; i++) {
            Drawf.tri(e.x, e.y, 6, 100 * e.fout(), i * 90);
        }

        Draw.color();
        for (var i = 0; i < 4; i++) {
            Drawf.tri(e.x, e.y, 3, 35 * e.fout(), i * 90);
        }
    });

    /** Teleport sound */
    public static Sound teleportSound = Sounds.plasmaboom;

    /** 传送1 冷却 */
    public float cooldown1 = 60 * 3;
    /** 传送1 距离 */
    public int range1 = 22 * Vars.tilesize;
    /** 传送2 冷却 */
    public float cooldown2 = 60 * 12;
    /** 传送2 冷却 */
    public int range2 = 26 * Vars.tilesize;

    public Seq<SkillDefinition> skillDefinitions;

    public EquaUnitType() {
        super("equa");

        this.constructor = SkilledPayloadUnit::new;
        armor = 17;
        health = 20000;
        speed = 0.8F;
        rotateSpeed = 1;
        accel = 0.04F;
        drag = 0.018F;
        flying = true;
        engineOffset = 46;
        engineSize = 7.8F;
        faceTarget = false;
        hitSize = 60;
        payloadCapacity = (5.3F * 5.3F) * Vars.tilePayload;
        buildSpeed = 4;
        drawShields = false;
        lowAltitude = true;

        abilities.add(new DeflectForceFieldAbility());
    }

    @Override
    public void load() {
        super.load();
        this.description = Core.bundle.format(this.getContentType() + "." + this.name + ".description",
            cooldown1 / 60,
            range1 / Vars.tilesize,
            cooldown2 / 60,
            range2 / Vars.tilesize
        );

        skillDefinitions = Seq.with(
            new SkillDefinition("teleport") {
                {
                    this.range = range1;
                    this.icon = Lib.loadRegion("teleport1");
                    this.directive = true;
                    this.exclusive = false;
                    this.activeTime = -1;
                    this.cooldown = EquaUnitType.this.cooldown1;
                }

                @Override
                public void active(SkillStatus status, SkilledUnit unit, Object dato) {
                    DirectiveSkillData data = (DirectiveSkillData) dato;
                    teleportEffect.at(unit.x(), unit.y());
                    teleportSound.at(unit.x(), unit.y(), Mathf.random(0.9F, 1.1F));
                    var targetX = data.x;
                    var targetY = data.y;
                    Tmp.v1.set(targetX, targetY).sub(unit.x(), unit.y());
                    Tmp.v1.setLength(Math.min(status.def.range, Tmp.v1.len()));
                    unit.x(unit.x() + Tmp.v1.x);
                    unit.y(unit.y() + Tmp.v1.y);
                    unit.snapInterpolation();
                    teleportEffect.at(unit.x(), unit.y());
                    teleportSound.at(unit.x(), unit.y(), Mathf.random(0.9F, 1.1F));
                    // Try active skill if serval Collapse under control
                    // unit.controlling.each((mem -> {
                    // if (mem.type == unit.type) {
                    //     mem.tryActiveSkill(this.name, data);
                    // }
                    //         }));
                }
            }
        );
    }


    @Override
    public Seq<SkillDefinition> getSkillDefinitions() {
        return skillDefinitions;
    }
}
