import { Gdk, Gtk } from "ags/gtk4"
import { Accessor } from "ags"
import { playGrantedSound } from "./utility";
import Pango from "gi://Pango";

type EntryContentProps = {
    name?: string | Accessor<string> | undefined;
    value?: string | Accessor<string> | undefined;
    css?: string | Accessor<string> | undefined;
    hexpand?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    allowCopy?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    useMarkup?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    orientation?: Gtk.Orientation | Accessor<NonNullable<Gtk.Orientation | undefined>> | undefined
    ellipsize?: Pango.EllipsizeMode | Accessor<NonNullable<Pango.EllipsizeMode | undefined>> | undefined
};

export default function CreateEntryContent({ name, value, css, hexpand = false, allowCopy = false, useMarkup = false, orientation = Gtk.Orientation.VERTICAL, ellipsize }: EntryContentProps) {
    const valueStr = typeof value === "string" ? value : value?.get() || "";
    function copyToClipboard(text: string) {
        const clipboard = (Gdk.Display.get_default()?.get_clipboard() as Gdk.Clipboard | null);
        if (clipboard && text) {
            clipboard.set_content(Gdk.ContentProvider.new_for_value(text));
            playGrantedSound();
        }
    }
    return (
        <box orientation={orientation} spacing={orientation == Gtk.Orientation.VERTICAL ? 1.5 : 3.0} hexpand={hexpand}>
            {allowCopy && (
                <Gtk.GestureClick onPressed={() => { copyToClipboard(valueStr); }} />
            )}
            <label label={`${name}:`} css={css} halign={Gtk.Align.START} />
            <label 
                useMarkup={useMarkup} 
                cssClasses={["value", "start-animation", allowCopy ? "copyable" : ""]} 
                css={css} 
                label={valueStr} 
                halign={Gtk.Align.START} 
                wrap 
                wrapMode={Gtk.WrapMode.CHAR} 
                ellipsize={ellipsize}
                cursor={allowCopy ? Gdk.Cursor.new_from_name("pointer", null) : undefined} />
        </box>
    )
}