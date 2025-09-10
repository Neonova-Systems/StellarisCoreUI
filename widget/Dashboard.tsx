import { Astal, Gtk, Gdk } from "ags/gtk4"
import { With } from "ags"
import { createState } from "ags";
import { CreatePanel, playPanelSound } from "../helper";
import SystemInfo from "../card/system-info";
import NetworkInfo from "../card/network-info";
import FilesystemInfo from "../card/filesystem-info";
import HardwareInfo from "../card/hardware-info";
import BatteryInfo from "../card/battery-info";
import { createPoll } from "ags/time";
import { execAsync } from "ags/process";
import SystemTray from "../modules/trayer";
import GLib from "gi://GLib?version=2.0";
import Gio from "gi://Gio?version=2.0";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import MusicPlayer from "../modules/music-player";
import BatteryFrame from "./BatteryFrame";
import app from "ags/gtk4/app";
import Screen from "../modules/wallpaper";
import LayerInformation from "./LayerInformation";

const HOME_DIR = GLib.get_home_dir();
export default function Dashboard(gdkmonitor: Gdk.Monitor) {
    const { LEFT, TOP } = Astal.WindowAnchor
    const [dataStreamState, setDataStreamState] = createState(true);
    const [currentDate, setCurrentDate] = createState("");
    const hyprland = AstalHyprland.get_default();

    execAsync('ags request "getDataStreamState"').then((out) => { setDataStreamState(out === 'true'); }).catch(() => {});

    function panelClicked() {
        execAsync('ags request "toggleDataStream"').then(out => {
            const isVisible = out === 'true';
            setDataStreamState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        }).catch(() => {});
    }

    const currentTime = createPoll("", 1000, () => { return GLib.DateTime.new_now_local().format("%H:%M:%S %Z")! })
    execAsync(`date '+%B, %d/%m/%y'`).then((out) => setCurrentDate(out.toUpperCase()));
    return ( <window visible
        name="Dashboard"
        layer={Astal.Layer.BACKGROUND}
        cssClasses={["Dashboard"]}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={hyprland.focused_monitor.width}
        defaultHeight={hyprland.focused_monitor.height}
        application={app}
        anchor={ LEFT | TOP }>
        <box css="margin: 10px;" spacing={9} >
            <box cssClasses={["side-left"]} orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                <scrolledwindow vexpand={true}>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                        <box name={"dataStream"} orientation={Gtk.Orientation.VERTICAL} spacing={12}>
                            <CreatePanel name={"DATA STREAM"} onClicked={panelClicked} />
                            <With value={dataStreamState}>
                                {(v) => (
                                    <box visible={v} orientation={Gtk.Orientation.VERTICAL} spacing={11.8}>
                                        <SystemInfo />
                                        <NetworkInfo />
                                        <FilesystemInfo />
                                        <HardwareInfo />
                                        <BatteryInfo />
                                    </box>
                                )}
                            </With>
                        </box>
                        <box halign={Gtk.Align.FILL} homogeneous={false}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ProtocolAccessControl.svg`)} canShrink={false} halign={Gtk.Align.FILL} />
                            <box halign={Gtk.Align.FILL} hexpand />
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ornament.svg`)} canShrink={true} contentFit={Gtk.ContentFit.SCALE_DOWN} valign={Gtk.Align.START} halign={Gtk.Align.END} />
                        </box>
                    </box>
                </scrolledwindow>
                <MusicPlayer />
                <box homogeneous={true}>
                    <SystemTray />
                    <box cssClasses={["special-entry"]} spacing={2}>
                        <label label="CURRENT DATE:" halign={Gtk.Align.START} />
                        <label cssClasses={["value"]} label={currentDate} halign={Gtk.Align.START} />
                    </box>
                    <menubutton>
                        <box cssClasses={["special-entry"]} spacing={2} halign={Gtk.Align.END}>
                            <label label="CURRENT TIME:" halign={Gtk.Align.START} />
                            <label cssClasses={["value"]} label={currentTime} halign={Gtk.Align.START} />
                        </box>
                        <popover>
                            <Gtk.Calendar showWeekNumbers={true}/>
                        </popover>
                    </menubutton>
                </box>
            </box>
            <box hexpand cssClasses={["side-right"]} orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                <box cssClasses={["screen"]} hexpand={false} halign={Gtk.Align.FILL}>
                    <Screen />
                </box>
                <LayerInformation />
                <BatteryFrame />
            </box>
        </box>
    </window>)
}
