import { Gtk } from "ags/gtk4"
import { CreatePanel, HOME_DIR } from "../helper";
import Gio from "gi://Gio?version=2.0";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Alert from "../decoration/Alert";
import LayerInformation from "../card/layer-information";

export default function ExtraPane() {
    const hyprland = AstalHyprland.get_default();
    return (
        <box spacing={10} css={`min-height: ${hyprland.focused_monitor.height / 4.5 - 15}px;`} homogeneous={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={false}>
            <box orientation={Gtk.Orientation.VERTICAL} css="min-width: 390px;" spacing={10}>
                <LayerInformation />
                <Alert />
            </box>
            <box spacing={10} hexpand>
                <box cssClasses={["decoration-card"]} css="min-width: 120px;">
                    <Gtk.Picture cssClasses={["stagger-animation"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/decoration-2.svg`)} canShrink={false} halign={Gtk.Align.FILL}/>
                </box>
                <box cssClasses={["decoration-card", "stagger-animation"]}>
                    <Gtk.Picture cssClasses={["stagger-animation-alt"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/decoration-3.svg`)} canShrink={true} halign={Gtk.Align.FILL}/>
                </box>
            </box>
        </box>
    )
}
