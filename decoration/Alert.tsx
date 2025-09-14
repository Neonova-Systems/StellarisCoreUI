import { Gtk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";
import { HOME_DIR } from "../helper";

export default function Alert() {
    return (
        <box halign={Gtk.Align.FILL} homogeneous={false}>
            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/AlertNeuralSync.svg`)} canShrink={false} halign={Gtk.Align.FILL}/>
            <box halign={Gtk.Align.FILL} hexpand />
        </box>
    );
}
