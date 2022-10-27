package dimensionshard.types.blocks;

import dimensionshard.libs.Lib;
import mindustry.Vars;
import mindustry.world.blocks.defense.Wall;
import mindustry.world.meta.Stat;

/**
 * 带有护甲的围墙
 *
 * @author abomb4 2022-10-07
 */
public class ArmoredWall extends Wall {

    /** 护甲，直接伤害减免 */
    public int armor = 5;

    public ArmoredWall(String name) {
        super(name);
    }

    @Override
    public void setStats() {
        super.setStats();
        if (this.armor > 0) {
            this.stats.add(Stat.abilities, Lib.getMessage("stat", "blockArmor", String.valueOf(this.armor)));
        }
    }

    /** instance */
    public class ArmoredWallBuild extends Wall.WallBuild {

        @Override
        public void damage(float damage) {
            super.damage(Math.max(damage - ArmoredWall.this.armor, Vars.minArmorDamage * damage));
        }
    }
}
