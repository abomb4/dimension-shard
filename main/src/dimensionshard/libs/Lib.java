package dimensionshard.libs;

import arc.Core;
import arc.audio.Sound;
import arc.graphics.g2d.TextureRegion;
import arc.math.geom.Rect;
import arc.math.geom.Vec2;
import arc.struct.IntSet;
import arc.struct.Seq;
import mindustry.Vars;
import mindustry.entities.Damage;
import mindustry.entities.Effect;
import mindustry.game.Team;
import mindustry.gen.Bullet;
import mindustry.gen.Sounds;

/**
 * 顶级公用方法
 *
 * @author abomb4 2022-10-07
 */
public final class Lib {

    /** name */
    public static final String modName = "dimension-shard";

    /**
     * 从 bundle 中拼装信息
     *
     * @param type 类型
     * @param key  前缀
     * @param msgs 参数
     * @return 信息
     */
    public static String getMessage(String type, String key, String... msgs) {
        return Vars.headless ? "" : Core.bundle.format(type + "." + modName + "." + key, (Object[]) msgs);
    }

    /**
     * 读取一个贴图
     *
     * @param name 贴图名称
     * @return 贴图
     */
    public static TextureRegion loadRegion(String name) {
        return Vars.headless ? null : Core.atlas.find(modName + '-' + name, Core.atlas.find("clear"));
    }

    /**
     * 读取一个音效
     *
     * @param name 名称
     * @return 音效
     */
    public static Sound loadSound(String name) {
        return Vars.headless ? Sounds.none : Vars.tree.loadSound(name);
    }

    /**
     * 获取当前 Mod 版本
     *
     * @return Mod 信息
     */
    public static String getModVersion() {
        return Vars.mods.locateMod(modName).meta.version;
    }

    /**
     * 判断当前 mod 是否为 dev 版本
     *
     * @return 是否为 dev 版本
     */
    public static boolean isDev() {
        return getModVersion().contains("dev");
    }

    private static Vec2 tr = new Vec2();
    private static IntSet collidedBlocks = new IntSet();
    private static Vec2 seg1 = new Vec2();
    private static Vec2 seg2 = new Vec2();
    private static Rect rect = new Rect();
    private static Seq units = new Seq();
    private static Rect hitrect = new Rect();

    public enum PierceType {
        /** 贯穿，塑钢也不好使 */
        PIERCE,
        /** 贯穿不了 */
        BLOCKING,
        /** 普通，被塑钢阻塞 */
        NORMAL,
    }

    public static void damageLine(Bullet hitter, Team team, Effect effect, float x, float y, float angle, float length,
                                  boolean large, PierceType pierce) {
        if (pierce == PierceType.NORMAL) {
            Damage.collideLine(hitter, team, effect, x, y, angle, length, large, true);
        } else if (pierce == PierceType.BLOCKING) {
            Damage.collideLine(hitter, team, effect, x, y, angle, length, large, true, 1);
        } else {
            Damage.collideLine(hitter, team, effect, x, y, angle, length, large, false);
        }
    }
}
