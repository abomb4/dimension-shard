package dimensionshard;

import arc.util.Log;
import dimensionshard.libs.Lib;
import dimensionshard.types.blocks.DarkLightTurret;
import mindustry.Vars;
import mindustry.gen.Call;

/**
 * 多人模式通信
 *
 * @author abomb4 2022-10-10
 */
public class DsCall {

    /** Initialized */
    private static boolean clientInited = false;

    /** Delimiter of multiple values */
    private static final String DELIMITER = "_@_";

    /** key */
    public static final String TYPE_DARK_LIGHT_SHOT = Lib.modName + "-DarkLightShot";

    /**
     * 作为服务端通知所有客户端‘黑暗之光要射击了’，传递射击炮塔与射击角度
     */
    public static void darkLightShot(int tilePos, float rotation) {
        final var packet = tilePos + DELIMITER + rotation;
        Call.clientPacketUnreliable(TYPE_DARK_LIGHT_SHOT, packet);
    }

    /**
     * 初始化客户端
     */
    public static void initClientSide() {
        if (Vars.netClient != null && !clientInited) {
            Vars.netClient.addPacketHandler(TYPE_DARK_LIGHT_SHOT, (pack -> {
                final var split = pack.split(DELIMITER);
                if (split.length != 2) {
                    // ＷＲＯＮＧ packet！
                    Log.logger.log(Log.LogLevel.warn,
                        "Packet content [" + pack + "] is not a valid DarkLightShot packet, ignore!");
                    return;
                }
                final var tilePos = Integer.parseInt(split[0]);
                final var rotation = Float.parseFloat(split[1]);
                var tile = Vars.world.tile(tilePos);
                if (tile.block() instanceof DarkLightTurret) {
                    var building = (DarkLightTurret.DarkLightTurretBuild) tile.build;
                    building.serverShot(rotation);
                }
            }));
            clientInited = true;
        }
    }
}
