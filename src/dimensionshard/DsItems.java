package dimensionshard;

import arc.graphics.Color;
import mindustry.type.Item;
import mindustry.type.Liquid;
import mindustry.world.blocks.environment.OreBlock;

/**
 * @author abomb4 2022-10-07
 */
public final class DsItems {

    public static final Item dimensionShard = new Item("dimension-shard", DsColors.dimensionShardColor) {{
        this.explosiveness = 0.2F;
        this.hardness = 5;
        this.radioactivity = 1.4F;
        this.cost = 1.1F;
    }};

    public static final OreBlock dimensionShardOre = new OreBlock(dimensionShard) {{
        oreDefault = true;
        oreThreshold = 0.92F;
        oreScale = 26;
    }};

    public static final Item spaceCrystal = new Item("space-crystal", DsColors.spaceCrystalColor) {{
        this.explosiveness = 0.5F;
        this.hardness = 6;
        this.cost = 1.4F;
    }};
    public static final Item timeCrystal = new Item("time-crystal", DsColors.timeCrystalColor) {{
        this.radioactivity = 0.7F;
        this.hardness = 7;
        this.cost = 1.45F;
    }};
    public static final Item hardThoriumAlloy = new Item("hard-thorium-alloy", DsColors.hardThoriumAlloyColor) {{
        this.hardness = 8;
        this.radioactivity = 0.8F;
        this.cost = 1.43F;
    }};
    public static final Item dimensionAlloy = new Item("dimension-alloy", DsColors.dimensionAlloyColor) {{
        this.hardness = 12;
        this.cost = 1.8F;
    }};

    public static final Liquid timeFlow = new Liquid("time-flow", Color.valueOf("a76ab3")) {{
        this.heatCapacity = 2;
        this.temperature = 0.1F;
        this.viscosity = 0.85F;
        this.effect = DsStatusEffects.timeFreezingEffect;
        this.lightColor = Color.valueOf("a76ab333");
    }};

    public static final Liquid ionLiquid = new Liquid("ion-liquid", Color.valueOf("cee0e9")) {{
        this.heatCapacity = 2;
        this.temperature = 2;
        this.flammability = 2;
        this.explosiveness = 3;
        this.viscosity = 0.3F;
        this.lightColor = Color.valueOf("cee0e988");
        this.effect = DsStatusEffects.ionBurningEffect;
    }};
}
