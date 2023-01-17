package dimensionshard;

import arc.graphics.Color;
import mindustry.content.StatusEffects;
import mindustry.gen.Unit;
import mindustry.type.StatusEffect;

/**
 * @author abomb4 2022-10-10
 */
public class DsStatusEffects {

    /** 时间减速效果 */
    public static StatusEffect timeFreezingEffect = new StatusEffect("time-freezing") {{
        this.color = Color.valueOf("6ecdec");
        this.speedMultiplier = 0.4F;
        this.reloadMultiplier = 0.4F;
        this.buildSpeedMultiplier = 0.6F;
        this.effect = DsFx.fxTimeFreezing;
        this.init(() -> this.opposite(StatusEffects.melting, StatusEffects.burning));
    }};

    /** 离子灼烧效果，烧血，减少防御力 */
    public static StatusEffect ionBurningEffect = new StatusEffect("ion-burning") {{
        this.color = Color.valueOf("cee0e9");
        this.damage = 0.6F;
        this.healthMultiplier = 0.70F;
        this.init(() -> this.opposite(StatusEffects.wet, StatusEffects.freezing, timeFreezingEffect));
    }};

    /** 无法移动效果 */
    public static StatusEffect darkLightedEffect = new StatusEffect("dark-lighted") {{
        this.show = false;
        this.speedMultiplier = 0.1F;
        this.effect = DsFx.fxTimeFreezing;
    }};

    /** 初级过载 */
    public static StatusEffect hyper1 = new StatusEffect("hyperspeed-1") {
        {
            this.show = false;
            this.damage = 4 / 60F;
            this.effectChance = 0.4F;
            this.effect = DsFx.hyperSpeed1Effect;
            this.speedMultiplier = 1.3F;
            this.reloadMultiplier = 2.5F;
            this.buildSpeedMultiplier = this.reloadMultiplier;
            this.color = Color.valueOf("cee0e9");
        }

        @Override
        public void update(Unit unit, float time) {
            super.update(unit, time);
            // mine speed
            if (unit.mining()) {
                unit.mineTimer += unit.type.mineSpeed * (this.reloadMultiplier - 1);
            }
        }
    };

    /** 高级过载 */
    public static StatusEffect hyper2 = new StatusEffect("hyperspeed-2") {
        {
            this.show = false;
            this.damage = 5 / 60F;
            this.effectChance = 0.5F;
            this.effect = DsFx.hyperSpeed2Effect;
            this.speedMultiplier = 1.6F;
            this.reloadMultiplier = 4.5F;
            this.buildSpeedMultiplier = this.reloadMultiplier;
            this.color = Color.valueOf("69dcee");
        }

        @Override
        public void update(Unit unit, float time) {
            super.update(unit, time);
            // mine speed
            if (unit.mining()) {
                unit.mineTimer += unit.type.mineSpeed * (this.reloadMultiplier - 1);
            }
        }
    };
}
