import { Gtk } from "ags/gtk4"
import { CreatePanel, HOME_DIR } from "../helper";
import Gio from "gi://Gio?version=2.0";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Alert from "../decoration/Alert";
import LayerInformation from "../card/layer-information";
import FavoritesItem from "../card/favorites-item";
import { For, With, createBinding } from 'ags';

export default function ExtraPane() {
    const hyprland = AstalHyprland.get_default();
    const workspaces = createBinding(hyprland, "workspaces")((value) => value.sort((a, b) => a.id - b.id)); // sort workspace by id
    const focusedWorkspace = createBinding(hyprland, "focusedWorkspace");

    workspaces.get().map((value) => {
        print(`id: ${value.id} name: ${value.name}`)
        print("monitor: " + value.monitor)
        print("fullscreen: " + value.hasFullscreen)
    })
    return (
        <box spacing={10} css={`min-height: ${hyprland.focused_monitor.height / 4.5 - 15}px;`} homogeneous={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={false}>
            <scrolledwindow vexpand={false} hexpand={false} css={`min-width: 390px;`}>
                <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                    <LayerInformation />
                    <FavoritesItem />
                    <Alert />
                </box>
            </scrolledwindow>
            <box spacing={10} hexpand>
                <box cssClasses={["decoration-card"]} css="min-width: 120px;">
                    <Gtk.Picture cssClasses={["stagger-animation"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/decoration-2.svg`)} canShrink={false} halign={Gtk.Align.FILL}/>
                </box>
                <scrolledwindow vexpand={false} hexpand={true}>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
                        <box cssClasses={["workspace-container"]} css={`min-height: 3px;`} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} orientation={Gtk.Orientation.HORIZONTAL} spacing={10}>
                            <For each={workspaces}>
                                {(workspace: any) => (
                                    <button onClicked={() => workspace.focus()}>
                                        <With value={focusedWorkspace}>
                                            {(value: any) => <box cssClasses={[value.id == workspace.id ? "focused-item" : "item"]} spacing={5} hexpand /> }
                                        </With>
                                    </button>
                                )}
                            </For>
                        </box>
                        <box cssClasses={["decoration-card", "stagger-animation"]}>
                            <Gtk.Picture cssClasses={["stagger-animation-alt"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/decoration-3.svg`)} canShrink={false} halign={Gtk.Align.FILL}/>
                        </box>
                    </box>
                </scrolledwindow>
            </box>
        </box>
    )
}
