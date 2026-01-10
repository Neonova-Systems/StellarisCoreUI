import Notification from "../modules/notifications";
import { Accessor, With, For, createState } from "ags"
import { CreatePanel, HOME_DIR, panelClicked, playGrantedSound, playPanelSound, TOOLTIP_TEXT_CONTEXT_MENU } from "../helper";
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import { execAsync } from "ags/process";
import { timeout } from "ags/time";

export function NotificationCard({ notifications, onDragUp, onDragDown }: { notifications: Accessor<AstalNotifd.Notification[]>, onDragUp?: () => void, onDragDown?: () => void }) {
    const [toggleContentState, settoggleContentState] = createState(false);
    timeout(500, () => { execAsync('ags request "getNotificationState"').then((out) => { settoggleContentState(out === 'true'); }) });

    function onRightClicked() {
        execAsync(`ags run ${HOME_DIR}/.config/ags/window/context-menu/notifications.tsx --gtk 4`).catch((e) => print(e))
        playGrantedSound();
    }

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NOTIFICATION" onClicked={() => panelClicked("Notification", settoggleContentState)} draggable onDragUp={onDragUp} onDragDown={onDragDown} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU}/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} visible={notifications((ns) => ns.length > 0)} spacing={5} halign={Gtk.Align.FILL} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <For each={notifications}>
                                {(notification) => <Notification notification={notification} />}
                            </For>
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}