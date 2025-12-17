import { Astal, Gtk, Gdk } from "ags/gtk4"
import { With, For, createState, onCleanup } from "ags"
import { CreatePanel, playPanelSound, createDashboardCards } from "../helper";
import SystemInfo from "../card/data-stream/system-info";
import NetworkInfo from "../card/data-stream/network-info";
import FilesystemInfo from "../card/data-stream/filesystem-info";
import HardwareInfo from "../card/data-stream/hardware-info";
import { BatteryInfo, BatteryRibbon } from "../card/data-stream/battery-info";
import { createPoll, timeout } from "ags/time";
import { execAsync } from "ags/process";
import SystemTray from "../modules/trayer";
import GLib from "gi://GLib?version=2.0";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import MusicPlayer from "../card/music-player";
import app from "ags/gtk4/app";
import Wallpaper from "../modules/wallpaper";
import Ornaments from "../decoration/Ornaments";
import AstalNotifd from "gi://AstalNotifd"
import ExtraPane from "./ExtraPane";
import Screen from "./Screen";

export default function Dashboard(gdkmonitor: Gdk.Monitor) {
    const { LEFT, TOP } = Astal.WindowAnchor
    const notifd = AstalNotifd.get_default()
    const hyprland = AstalHyprland.get_default();
    const [dataStreamState, setDataStreamState] = createState(true);
    const [currentDate, setCurrentDate] = createState("");
    const [notifications, setNotifications] = createState(new Array<AstalNotifd.Notification>(),)

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

    const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
        const notification = notifd.get_notification(id)
        if (replaced && notifications.get().some((n) => n.id === id)) {
            setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
        } else {
            setNotifications((ns) => [notification, ...ns])
        }
    })

    const resolvedHandler = notifd.connect("resolved", (_, id) => {
        setNotifications((ns) => ns.filter((n) => n.id !== id))
    })

    const currentTime = createPoll("", 1000, () => { return GLib.DateTime.new_now_local().format("%H:%M:%S %Z")! })
    execAsync(`date '+%B, %d/%m/%y'`).then((out) => setCurrentDate(out.toUpperCase()));
    
    // Initialize dashboard cards with persistence
    const { dashboardCards } = createDashboardCards(notifications);

    return ( <window visible
        $={(self) => onCleanup(() => {
            notifd.disconnect(notifiedHandler)
            notifd.disconnect(resolvedHandler)
            self.destroy()
        })}
        name="Dashboard"
        layer={Astal.Layer.BACKGROUND}
        cssClasses={["Dashboard"]}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={hyprland.focused_monitor.width}
        default_height={hyprland.focused_monitor.height}
        application={app}
        namespace={"dashboard"}
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
                        <For each={dashboardCards}>
                            {(card) => <card.component />}
                        </For>
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
                <Screen />
                <ExtraPane />
                <BatteryRibbon />
            </box>
        </box>
    </window>)
}
