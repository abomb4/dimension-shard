package dimensionshard;

import arc.graphics.Color;
import mindustry.type.Item;
import mindustry.type.Liquid;
import mindustry.world.blocks.environment.OreBlock;

/**
 * @author abomb4 2022-10-07
 */
public final class DsItems {

    public static final Color dimensionShardColor = Color.valueOf("165282");
    public static final Color dimensionShardColorLight = Color.valueOf("719ec1");
    public static final Color spaceCrystalColor = Color.valueOf("4064e9");
    public static final Color spaceCrystalColorLight = Color.valueOf("92a2dc");
    public static final Color timeCrystalColor = Color.valueOf("9b3db0");
    public static final Color hardThoriumAlloyColor = Color.valueOf("993a3a");
    public static final Color hardThoriumAlloyColorLight = Color.valueOf("d97368");
    public static final Color dimensionAlloyColor = Color.valueOf("20c0d6");
    public static final Color dimensionAlloyColorLight = Color.valueOf("69dcee");

    public static final Item dimensionShard = new Item("dimension-shard", dimensionShardColor) {{
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

    public static final Item spaceCrystal = new Item("space-crystal", spaceCrystalColor) {{
        this.explosiveness = 0.5F;
        this.hardness = 6;
        this.cost = 1.4F;
    }};
    public static final Item timeCrystal = new Item("time-crystal", timeCrystalColor) {{
        this.radioactivity = 0.7F;
        this.hardness = 7;
        this.cost = 1.45F;
    }};
    public static final Item hardThoriumAlloy = new Item("hard-thorium-alloy", hardThoriumAlloyColor) {{
        this.hardness = 8;
        this.radioactivity = 0.8F;
        this.cost = 1.43F;
    }};
    public static final Item dimensionAlloy = new Item("dimension-alloy", dimensionAlloyColor) {{
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
