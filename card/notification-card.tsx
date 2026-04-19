import Notification from "../modules/notifications";
import { Accessor, With, For, createState } from "ags"
import { Align, AudioFile, CreatePanel, HOME_DIR, ICON_DIR, panelClicked, playSound, TOOLTIP_TEXT_CONTEXT_MENU } from "../helper";
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import CreateUtilityButton from "../helper/create-utility-button";
import { initToggleState, openContextMenu, watchRequestBoolean } from "../helper/behaviour";

interface NotificationStack {
    key: string;
    count: number;
    primary: AstalNotifd.Notification;
    notifications: AstalNotifd.Notification[];
}

function notificationStackKey(notification: AstalNotifd.Notification) {
    return [ notification.appName, 
        notification.desktopEntry, 
        notification.summary, 
        notification.body, notification.category, notification.urgency, ].join("||");
}

function stackNotifications(notificationList: AstalNotifd.Notification[]) {
    const stacks = new Map<string, NotificationStack>();

    notificationList.forEach((notification) => {
        const key = notificationStackKey(notification);
        const existing = stacks.get(key);

        if (existing) {
            existing.count += 1;
            existing.notifications.push(notification);
            return;
        }

        stacks.set(key, { key, count: 1, primary: notification, notifications: [notification], });
    });

    return Array.from(stacks.values());
}

export function NotificationCard({ notifications, onDragUp, onDragDown }: { notifications: Accessor<AstalNotifd.Notification[]>, onDragUp?: () => void, onDragDown?: () => void }) {
    const [toggleContentState, settoggleContentState] = createState(false);
    const [notifcationDNDState, setNotificationDND] = createState(false)
    const stackedNotifications = notifications((notificationList) => stackNotifications(notificationList));
    watchRequestBoolean("NotificationDND", 1000, setNotificationDND);
    initToggleState("Notification", settoggleContentState);

    function onRightClicked() {
        openContextMenu("notifications.tsx");
    }

    function dismissAllNotifications() {
        const notificationList = notifications.get();
        notificationList.forEach((notification) => {
            notification.dismiss();
        });
        playSound(AudioFile.Enter);
    }

    return (
        <box cssClasses={["card"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NOTIFICATION" onClicked={() => panelClicked("Notification", settoggleContentState)} draggable onDragUp={onDragUp} onDragDown={onDragDown} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU} childrenRight={
                <button onClicked={dismissAllNotifications} cssClasses={["clickable"]} tooltipText={"Dismiss all notifications"}>
                    <image file={`${ICON_DIR}/material-symbols--clear-all.svg`} pixelSize={16} />
                </button>
            }/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} visible={notifications((ns) => ns.length > 0)} spacing={5} halign={Align.FILL} orientation={Gtk.Orientation.VERTICAL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                            <For each={stackedNotifications}>
                                {(notificationStack) => (
                                    <Notification
                                        notification={notificationStack.primary}
                                        mute={notifcationDNDState.peek()}
                                        stackCount={notificationStack.count}
                                        onDismiss={() => notificationStack.notifications.forEach((notification) => notification.dismiss())}
                                    />
                                )}
                            </For>
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}