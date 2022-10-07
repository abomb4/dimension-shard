package dimensionshard.libs;

import arc.Core;
import arc.audio.Sound;
import arc.graphics.g2d.TextureRegion;
import mindustry.Vars;
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
}
