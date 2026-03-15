import { Gdk, Gtk } from "ags/gtk4"
import { For, With, createBinding, createState } from 'ags';
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Align } from "../helper";

export default function Workspaces() {
    const hyprland = AstalHyprland.get_default();
    const workspaces = createBinding(hyprland, "workspaces")((value) => value.sort((a, b) => a.id - b.id)); // sort workspace by id
    const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");
    return (
        <box cssClasses={["workspace-container"]} css={`min-height: 3.5px;`} halign={Align.FILL} valign={Align.FILL} orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
            <For each={workspaces}>
                {(workspace: any) => (
                    <button onClicked={() => workspace.focus()} tooltipText={`Click to change into workspace ${workspace.id}`} cursor={Gdk.Cursor.new_from_name("crosshair", null)}>
                        <Gtk.DropControllerMotion onEnter={() => workspace.focus()} />
                        <With value={focusedWorkspace}>
                            {(value: any) => <box cssClasses={[value.id == workspace.id ? "focused-item" : "item"]} spacing={5} hexpand />}
                        </With>
                    </button>
                )}
            </For>
        </box>
    )
}