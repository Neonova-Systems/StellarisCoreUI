import { Gtk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import { HOME_DIR } from "../helper";

export default function Ornaments() {
    return (
        <box halign={Gtk.Align.FILL} homogeneous={false} css={"margin-bottom: 20px;"}>
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ProtocolAccessControl.svg`)} canShrink={false} halign={Gtk.Align.FILL} />
            <box halign={Gtk.Align.FILL} hexpand />
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ornament.svg`)} canShrink={true} contentFit={Gtk.ContentFit.SCALE_DOWN} valign={Gtk.Align.START} halign={Gtk.Align.END} />
        </box>
    );
}
