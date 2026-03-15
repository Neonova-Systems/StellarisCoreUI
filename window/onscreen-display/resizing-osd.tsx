import app from "ags/gtk4/app";
import style from "./style.scss";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { timeout } from "ags/time";
import { Align, HOME_DIR } from '../../helper/constants';
import { AudioFile, CreateEntryContent, playSound } from "../../helper";
import { execAsync } from "ags/process";

const hyprland = AstalHyprland.get_default();
const focusedClient = hyprland.focusedClient;
const focusedClientX = focusedClient.x;
const focusedClientY = focusedClient.y;
const focusedClientWidth = focusedClient.width;
const focusedClientHeight = focusedClient.height;
const osdWidth = 120;
const osdHeight = 60;
const ratioValue = (() => {
    const w = Math.abs(focusedClientWidth);
    const h = Math.abs(focusedClientHeight);

    if (w === 0 || h === 0) {
        return "N/A";
    }

    const ratio = w / h;
    const presets = [
        { label: "1:1", value: 1 / 1 },
        { label: "4:3", value: 4 / 3 },
        { label: "5:4", value: 5 / 4 },
        { label: "3:2", value: 3 / 2 },
        { label: "16:10", value: 16 / 10 },
        { label: "16:9", value: 16 / 9 },
        { label: "21:9", value: 21 / 9 },
        { label: "32:9", value: 32 / 9 },
    ];

    let closest = presets[0];
    let smallestDelta = Math.abs(ratio - closest.value);

    for (const preset of presets) {
        const delta = Math.abs(ratio - preset.value);
        if (delta < smallestDelta) {
            smallestDelta = delta;
            closest = preset;
        }
    }

    return closest.label;
})();

function OSD() {
    return ( <window visible
        name="resizing-osd"
        layer={Astal.Layer.TOP}
        exclusivity={Astal.Exclusivity.IGNORE}
        default_width={osdWidth}
        default_height={osdHeight}
        application={app}
        anchor={Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP}
        keymode={Astal.Keymode.NONE}
        marginTop={Math.round(focusedClientY + (focusedClientHeight / 2) - (osdHeight / 2))}
        marginLeft={Math.round(focusedClientX + (focusedClientWidth / 2) - (osdWidth / 2))}
        namespace={"resizing-osd"}>
        <box cssClasses={["onscreen-display", "with-bg", "shadow"]} css={'margin: 5px;'} valign={Align.FILL} vexpand>
            <Gtk.GestureClick onPressed={() => {  
                execAsync(`ags run ${HOME_DIR}/.config/ags/window/context-menu/ratio-preset-selection.tsx --gtk 4`).catch((e) => print(e))
                playSound(AudioFile.Granted);
            }} />
            <box cssClasses={["contents", "entry"]} valign={Align.FILL} orientation={Gtk.Orientation.VERTICAL} spacing={3} hexpand>
                <box vexpand/>
                <CreateEntryContent animation={false} orientation={Gtk.Orientation.HORIZONTAL} name={"SIZE"} value={`${focusedClientWidth}x${focusedClientHeight}`} />
                <CreateEntryContent animation={false} orientation={Gtk.Orientation.HORIZONTAL} name={"POSITION"} value={`${focusedClientX}, ${focusedClientY}`} />
                <CreateEntryContent animation={false} orientation={Gtk.Orientation.HORIZONTAL} name={"RATIO"} value={ratioValue} />
                <box vexpand/>
            </box>
        </box>
    </window>
    )
}

app.start({
    instanceName: "resizing-osd",
    css: style,
    main() { 
        OSD();
        timeout(1433, () => { app.quit() });
    },
})