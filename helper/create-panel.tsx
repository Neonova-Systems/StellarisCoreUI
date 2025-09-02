import { Gdk, Gtk } from "ags/gtk4"
import { Accessor } from "ags"

type PanelProps = {
    name?: string | Accessor<string> | undefined;
    onClicked?: ((source: Gtk.Button) => void) | undefined
    $?: ((self: Gtk.Button) => void) | undefined;
    children?: JSX.Element | Array<JSX.Element>
};

export default function CreatePanel({ name, onClicked, $, children }: PanelProps) {
    return (
        <button $={$} cssClasses={["panel"]} onClicked={onClicked} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
            <box spacing={5}>
                {children}
                <label label={name} halign={Gtk.Align.START} />
            </box>
        </button>
    )
}
