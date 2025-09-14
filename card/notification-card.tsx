import Notification from "../modules/notifications";
import { Accessor, With, For, createState } from "ags"
import { CreatePanel, playPanelSound } from "../helper";
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import { execAsync } from "ags/process";
import { timeout } from "ags/time";

export function NotificationCard({ notifications }: { notifications: Accessor<AstalNotifd.Notification[]> }) {
    const [toggleContentState, settoggleContentState] = createState(false);

    timeout(500, () => { execAsync('ags request "getNotificationState"').then((out) => { settoggleContentState(out === 'true'); }) });

    function panelClicked() {
        execAsync('ags request "toggleNotification"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        });
    }

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NOTIFICATION" onClicked={panelClicked} />
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