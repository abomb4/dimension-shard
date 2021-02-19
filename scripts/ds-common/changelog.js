// Copyright (C) 2020 abomb4
//
// This file is part of Dimension Shard.
//
// Dimension Shard is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Dimension Shard is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Dimension Shard.  If not, see <http://www.gnu.org/licenses/>.

const lib = require('abomb4/lib');

const SETTING_KEY = lib.modName + "-changelog-version";
const version = lib.mod.meta.version;
// Core.settings.remove(SETTING_KEY)
function getChangeLogTextArray() {
    let text = lib.getMessage("msg", "changelogText");
    print(text);
    print(text.split("\n"));
    return text.split("\n");
}
function getWelcomeTextArray() {
    let text = lib.getMessage("msg", "welcomeText");
    return text.split("\n");
}
function showDialog(firstRun) {
    let dontShowAgain = true;

    let dialog = new BaseDialog(lib.getMessage("msg", "changelogTitle", version));

    dialog.buttons.defaults().size(210, 64);
    dialog.buttons.add((() => {
        let box = new CheckBox(lib.getMessage("msg", "dontShowAgain"));
        box.update(run(() => {
            box.setChecked(dontShowAgain);
        }));
        box.changed(run(() => {
            dontShowAgain = !dontShowAgain;
        }));
        box.left();
        return box;
    })());
    dialog.buttons.row();
    dialog.buttons.button("@close", run(() => {
        dialog.hide();
        if (dontShowAgain) {
            Core.settings.put(SETTING_KEY, version)
        }
    })).size(210, 64);

    dialog.cont.pane((() => {

        let table = new Table();
        if (firstRun) {
            table.add(lib.getMessage("msg", "welcomeText"))
                .left().growX().wrap().width(700).maxWidth(700).pad(4).labelAlign(Align.left);
            table.row();
        }

        table.image().color(Color.valueOf("69dcee")).fillX().height(3).pad(3);
        table.row();
        table.add(lib.getMessage("msg", "currentVersion", version))
            .left().growX().wrap().width(700).maxWidth(700).pad(4).labelAlign(Align.left);
        table.row();
        table.image().color(Color.valueOf("69dcee")).fillX().height(3).pad(3);
        table.row();

        table.add(lib.getMessage("msg", "changelogText"))
            .left().growX().wrap().width(700).pad(4).labelAlign(Align.left);
        table.row();
        return table;
    })()).grow().center().maxWidth(700);

    dialog.show();
}

Events.run(ClientLoadEvent, run(() => {
    const saveVer = Core.settings.getString(SETTING_KEY, null)

    if (lib.isDev()) {
        showDialog();
        return;
    }
    if (version != saveVer) {
        showDialog(saveVer == null);
    }
}));
