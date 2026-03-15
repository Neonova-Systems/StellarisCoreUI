import app from "ags/gtk4/app";
import style from "./style.scss";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { timeout } from "ags/time";
import { Align } from '../../helper/constants';

const hyprland = AstalHyprland.get_default();
const focusedClient = hyprland.focusedClient;
const focusedClientX = focusedClient.x;
const focusedClientY = focusedClient.y;
const focusedClientWidth = focusedClient.width;
const focusedClientHeight = focusedClient.height;
const osdWidth = 99;
const osdHeight = 40;


// TODO: When get clicked spawn context menu for choosing focusedclient size ratio
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
        <box cssClasses={["onscreen-display", "with-bg"]} valign={Align.FILL} vexpand>
            <box cssClasses={["contents"]} halign={Align.FILL} hexpand>
                <label label={`${focusedClientWidth}x${focusedClientHeight}`} />
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