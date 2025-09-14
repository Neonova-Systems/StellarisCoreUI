import Notification from "../modules/notifications";
import { Accessor, With, For, createState } from "ags"
import { CreatePanel } from "../helper";
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"

export function NotificationCard({ notifications }: { notifications: Accessor<AstalNotifd.Notification[]> }) {
    const [toggleContentState, settoggleContentState] = createState(true);

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name="NOTIFICATION" onClicked={() => { }} />
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} spacing={5} halign={Gtk.Align.FILL} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
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