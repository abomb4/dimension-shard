package dimensionshard;

import arc.graphics.Color;
import mindustry.content.Fx;
import mindustry.content.StatusEffects;
import mindustry.type.StatusEffect;

/**
 * @author abomb4 2022-10-10
 */
public class DsStatusEffects {

    /** 时间减速效果 */
    public static StatusEffect timeFreezingEffect = new StatusEffect("time-freezing") {{
        this.color = Color.valueOf("6ecdec");
        this.speedMultiplier = 0.4F;
        this.effect = DsFx.fxTimeFreezing;
        this.init(() -> this.opposite(StatusEffects.melting, StatusEffects.burning));
    }};

    /** 离子灼烧效果，烧血，减少防御力 */
    public static StatusEffect ionBurningEffect = new StatusEffect("ion-burning") {{
        this.color = Color.valueOf("cee0e9");
        this.damage = 0.6F;
        this.healthMultiplier = 0.75F;
        this.init(() -> this.opposite(StatusEffects.wet, StatusEffects.freezing, timeFreezingEffect));
    }};

    /** 无法移动效果 */
    public static StatusEffect darkLightedEffect = new StatusEffect("dark-lighted") {{
        this.speedMultiplier = 0;
        this.effect = Fx.none;
    }};
}
