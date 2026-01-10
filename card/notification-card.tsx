import Notification from "../modules/notifications";
import { Accessor, With, For, createState } from "ags"
import { AudioFile, CreatePanel, HOME_DIR, ICON_DIR, panelClicked, playSound, TOOLTIP_TEXT_CONTEXT_MENU } from "../helper";
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import { execAsync } from "ags/process";
import { interval, timeout } from "ags/time";
import CreateUtilityButton from "../helper/create-utility-button";

export function NotificationCard({ notifications, onDragUp, onDragDown }: { notifications: Accessor<AstalNotifd.Notification[]>, onDragUp?: () => void, onDragDown?: () => void }) {
    const [toggleContentState, settoggleContentState] = createState(false);
    const [notifcationDNDState, setNotificationDND] = createState(false)
    interval(1000, () => { execAsync('ags request "getNotificationDNDState"').then(out => setNotificationDND(out === 'true')) });
    timeout(500, () => { execAsync('ags request "getNotificationState"').then((out) => { settoggleContentState(out === 'true'); }) });

    function onRightClicked() {
        execAsync(`ags run ${HOME_DIR}/.config/ags/window/context-menu/notifications.tsx --gtk 4`).catch((e) => print(e))
        playSound(AudioFile.Granted)
    }

    function dismissAllNotifications() {
        const notificationList = notifications.get();
        notificationList.forEach((notification) => {
            notification.dismiss();
        });
        playSound(AudioFile.Enter);
    }

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NOTIFICATION" onClicked={() => panelClicked("Notification", settoggleContentState)} draggable onDragUp={onDragUp} onDragDown={onDragDown} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU} childrenRight={
                <button onClicked={dismissAllNotifications} cssClasses={["clickable"]} tooltipText={"Dismiss all notifications"}>
                    <image file={`${ICON_DIR}/material-symbols--clear-all.svg`} pixelSize={16} />
                </button>
            }/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} visible={notifications((ns) => ns.length > 0)} spacing={5} halign={Gtk.Align.FILL} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <For each={notifications}>
                                {(notification) => <Notification notification={notification} mute={notifcationDNDState.get()}/>}
                            </For>
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}