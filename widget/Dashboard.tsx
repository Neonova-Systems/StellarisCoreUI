import { Astal, Gtk, Gdk } from "ags/gtk4"
import { With } from "ags"
import { createState } from "ags";
import { CreatePanel, playPanelSound } from "../helper";
import SystemInfo from "../card/system-info";
import NetworkInfo from "../card/network-info";
import FilesystemInfo from "../card/filesystem-info";
import HardwareInfo from "../card/hardware-info";
import { BatteryInfo, BatteryRibbon } from "../card/battery-info";
import { createPoll, timeout } from "ags/time";
import { execAsync } from "ags/process";
import SystemTray from "../modules/trayer";
import GLib from "gi://GLib?version=2.0";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import MusicPlayer from "../modules/music-player";
import app from "ags/gtk4/app";
import LayerInformation from "./LayerInformation";
import Wallpaper from "../modules/wallpaper";
import Ornaments from "../decoration/Ornaments";
import Notification from "../modules/notification";
import ControlCenter from "../modules/control-center";
import ExploitDeck from "../modules/exploit-deck";

export default function Dashboard(gdkmonitor: Gdk.Monitor) {
    const { LEFT, TOP } = Astal.WindowAnchor
    const [dataStreamState, setDataStreamState] = createState(true);
    const [currentDate, setCurrentDate] = createState("");
    const hyprland = AstalHyprland.get_default();
    timeout(500, () => { execAsync('ags request "getDataStreamState"').then((out) => { setDataStreamState(out === 'true'); }) });

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
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                        <box name={"dataStream"} orientation={Gtk.Orientation.VERTICAL} spacing={12} css={'margin-bottom: 2px;'}>
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
                        <Ornaments />
                        <Notification />
                        <ControlCenter />
                        <ExploitDeck />
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
                <box cssClasses={["screen"]} hexpand={false} halign={Gtk.Align.FILL} vexpand={true}>
                    <Wallpaper />
                </box>
                <LayerInformation />
                <BatteryRibbon />
            </box>
        </box>
    </window>)
}
