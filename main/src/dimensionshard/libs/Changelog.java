package dimensionshard.libs;

import arc.Core;
import arc.Events;
import arc.graphics.Color;
import arc.scene.ui.CheckBox;
import arc.scene.ui.layout.Table;
import arc.util.Align;
import mindustry.game.EventType;
import mindustry.ui.dialogs.BaseDialog;

/**
 * 显示更新信息
 *
 * @author abomb4 2022-10-09
 */
public class Changelog {

    /** Setting key */
    public static final String CHANGE_LOG_SETTING_KEY = Lib.modName + "-changelog-version";

    /** non thread safe global variable */
    private static boolean dontShowAgain;

    /**
     * 显示更新日志窗口
     *
     * @param withWelcome 是否显示欢迎信息，一般第一次玩这个 mod 时需要显示，后面几次只显示更新内容
     */
    public static void showDialog(boolean withWelcome) {
        dontShowAgain = true;
        final String version = Lib.getModVersion();

        BaseDialog dialog = new BaseDialog(Lib.getMessage("msg", "changelogTitle", version));

        dialog.buttons.defaults().size(210, 64);
        CheckBox box = new CheckBox(Lib.getMessage("msg", "dontShowAgain"));
        box.update((() -> box.setChecked(dontShowAgain)));
        box.changed((() -> dontShowAgain = !dontShowAgain));
        box.left();
        dialog.buttons.add(box);
        dialog.buttons.row();
        dialog.buttons.button("@close", (() -> {
            dialog.hide();
            if (dontShowAgain) {
                Core.settings.put(CHANGE_LOG_SETTING_KEY, version);
            }
        })).size(210, 64);

        Table table = new Table();
        if (withWelcome) {
            table.add(Lib.getMessage("msg", "welcomeText"))
                .left().growX().wrap().width(700).maxWidth(700).pad(4).labelAlign(Align.left);
            table.row();
        }

        table.image().color(Color.valueOf("69dcee")).fillX().height(3).pad(3);
        table.row();
        table.add(Lib.getMessage("msg", "currentVersion", version))
            .left().growX().wrap().width(700).maxWidth(700).pad(4).labelAlign(Align.left);
        table.row();
        table.image().color(Color.valueOf("69dcee")).fillX().height(3).pad(3);
        table.row();

        table.add(Lib.getMessage("msg", "changelogText"))
            .left().growX().wrap().width(700).pad(4).labelAlign(Align.left);
        table.row();
        dialog.cont.pane(table).grow().center().maxWidth(700);
        dialog.show();
    }

    /**
     * 初始化
     */
    public static void init() {
        Events.run(EventType.ClientLoadEvent.class, () -> {
            if (Lib.isDev()) {
                // dev version always show dialog
                showDialog(true);
                return;
            }
            String saveVer = Core.settings.getString(CHANGE_LOG_SETTING_KEY, null);

            if (!Lib.getModVersion().equals(saveVer)) {
                showDialog(saveVer == null);
            }
        });
    }
}
