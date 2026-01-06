import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { exec, execAsync } from "ags/process";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Gio from "gi://Gio?version=2.0";
import { HOME_DIR } from "../helper";
import { playKeySound } from '../helper/utility';

const WIDTH = 23
const HEIGHT = 23
const hyprland = AstalHyprland.get_default();
const { LEFT, RIGHT, TOP, BOTTOM } = Astal.WindowAnchor

const marginBottom = hyprland.get_focused_monitor().height / 4
const marginLeft = hyprland.get_focused_monitor().width / 4 - 10
export function TopRightCorner(gdkmonitor: Gdk.Monitor) {
    function onClick() {
        exec('dash -c "hyprctl dispatch togglefloating; hyprctl dispatch centerwindow; hyprctl dispatch resizeactive exact 65% 65%"');
    }
    return ( <window visible
        name="TopRightCorner"
        layer={Astal.Layer.TOP}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={WIDTH}
        defaultHeight={HEIGHT}
        margin-top={10}
        margin-right={10}
        keymode={Astal.Keymode.NONE}
        application={app}
        namespace={"top-right-corner"}
        anchor={ RIGHT | TOP }>
        <button onClicked={onClick} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
            <Gtk.EventControllerMotion onEnter={() => playKeySound()} />
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/top-right-corner.svg`)} halign={Gtk.Align.FILL}/>
        </button>
    </window>)
}

export function BottomRightCorner(gdkmonitor: Gdk.Monitor) {
    function onClick() {}
    return ( <window visible
        name="BottomRightCorner"
        layer={Astal.Layer.TOP}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={WIDTH}
        defaultHeight={HEIGHT}
        margin-bottom={marginBottom}
        margin-right={10}
        keymode={Astal.Keymode.NONE}
        application={app}
        namespace={"bottom-right-corner"}
        anchor={ RIGHT | BOTTOM}>
        <button onClicked={onClick} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
            <Gtk.EventControllerMotion onEnter={() => playKeySound()} />
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/bottom-right-corner.svg`)} halign={Gtk.Align.FILL}/>
        </button>
    </window>)
}

export function BottomLeftCorner(gdkmonitor: Gdk.Monitor) {
    function onClick() {}
    return ( <window visible
        name="BottomLeftCorner"
        layer={Astal.Layer.BOTTOM}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={WIDTH}
        defaultHeight={HEIGHT}
        margin-bottom={marginBottom}
        margin-left={marginLeft}
        keymode={Astal.Keymode.NONE}
        application={app}
        namespace={"bottom-left-corner"}
        anchor={ LEFT | BOTTOM}>
        <button onClicked={onClick} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
            <Gtk.EventControllerMotion onEnter={() => playKeySound()} />
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/bottom-left-corner.svg`)} halign={Gtk.Align.FILL}/>
        </button>
    </window>)
}

export function TopLeftCorner(gdkmonitor: Gdk.Monitor) {
    function onClick() { 
        execAsync(`ags request "toggle dashboard"`) 
        execAsync(`dash -c "swww query | sed 's/.*image: //'"`).then((out) => execAsync(`ags request "updateWallpaper ${out}"`));
    }
    return ( <window visible
        name="TopLeftCorner"
        layer={Astal.Layer.TOP}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={WIDTH}
        defaultHeight={HEIGHT}
        margin-top={10}
        margin-left={marginLeft}
        keymode={Astal.Keymode.NONE}
        application={app}
        namespace={"top-left-corner"}
        anchor={ LEFT | TOP}>
        <button onClicked={onClick} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
            <Gtk.EventControllerMotion onEnter={() => playKeySound()} />
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/top-left-corner.svg`)} halign={Gtk.Align.FILL}/>
        </button>
    </window>)
}
