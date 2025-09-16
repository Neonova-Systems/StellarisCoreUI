import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createBinding, With, For, createState, onCleanup } from "ags"
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
import MusicPlayer from "../card/music-player";
import app from "ags/gtk4/app";
import LayerInformation from "./LayerInformation";
import Wallpaper from "../modules/wallpaper";
import Ornaments from "../decoration/Ornaments";
import ControlCenter from "../card/control-center";
import ExploitDeck from "../card/exploit-deck";
import { NotificationCard } from "../card/notification-card";

import AstalNotifd from "gi://AstalNotifd"
import Notification from "../modules/notifications";

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
    
    onCleanup(() => {
        notifd.disconnect(notifiedHandler)
        notifd.disconnect(resolvedHandler)
    })

    const currentTime = createPoll("", 1000, () => { return GLib.DateTime.new_now_local().format("%H:%M:%S %Z")! })
    execAsync(`date '+%B, %d/%m/%y'`).then((out) => setCurrentDate(out.toUpperCase()));
    
    // Array of cards to render with reordering functionality
    const [dashboardCards, setDashboardCards] = createState([
        { id: 'notification', component: () => <NotificationCard notifications={notifications} onDragUp={() => moveToFirst('notification')} onDragDown={() => moveToLast('notification')} /> }, 
        { id: 'control-center', component: () => <ControlCenter onDragUp={() => moveToFirst('control-center')} onDragDown={() => moveToLast('control-center')} /> }, 
        { id: 'exploit-deck', component: () => <ExploitDeck onDragUp={() => moveToFirst('exploit-deck')} onDragDown={() => moveToLast('exploit-deck')} /> }
    ]);

    function moveToFirst(cardId: string) {
        setDashboardCards(cards => {
            const cardIndex = cards.findIndex(card => card.id === cardId);
            if (cardIndex > 0) {
                const cardToMove = cards[cardIndex];
                const newCards = [cardToMove, ...cards.slice(0, cardIndex), ...cards.slice(cardIndex + 1)];
                return newCards;
            }
            return cards;
        });
    }

    function moveToLast(cardId: string) {
        setDashboardCards(cards => {
            const cardIndex = cards.findIndex(card => card.id === cardId);
            if (cardIndex >= 0 && cardIndex < cards.length - 1) {
                const cardToMove = cards[cardIndex];
                const newCards = [...cards.slice(0, cardIndex), ...cards.slice(cardIndex + 1), cardToMove];
                return newCards;
            }
            return cards;
        });
    }

    return ( <window visible
        $={(self) => onCleanup(() => self.destroy())}
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
                <box cssClasses={["screen"]} hexpand={false} halign={Gtk.Align.FILL} vexpand={true}>
                    <Wallpaper />
                </box>
                <LayerInformation />
                <BatteryRibbon />
            </box>
        </box>
    </window>)
}
