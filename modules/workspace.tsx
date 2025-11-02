import { Gtk } from "ags/gtk4"
import { For, With, createBinding } from 'ags';
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export default function Workspaces() {
    const hyprland = AstalHyprland.get_default();
    const workspaces = createBinding(hyprland, "workspaces")((value) => value.sort((a, b) => a.id - b.id)); // sort workspace by id
    const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

    // Debug only
    // workspaces.get().map((value) => {
    //     print(`id: ${value.id} name: ${value.name}`)
    //     print("monitor: " + value.monitor)
    //     print("fullscreen: " + value.hasFullscreen)
    // })
    return (
        <box cssClasses={["workspace-container"]} css={`min-height: 3px;`} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
            <For each={workspaces}>
                {(workspace: any) => (
                    <button onClicked={() => workspace.focus()}>
                        <With value={focusedWorkspace}>
                            {(value: any) => <box cssClasses={[value.id == workspace.id ? "focused-item" : "item"]} spacing={5} hexpand />}
                        </With>
                    </button>
                )}
            </For>
        </box>
    )
}