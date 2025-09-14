import { Gdk, Gtk } from "ags/gtk4"
import { Accessor } from "ags"

type EntryContentProps = {
    name?: string | Accessor<string> | undefined;
    value?: string | Accessor<string> | undefined;
    css?: string | Accessor<string> | undefined;
    hexpand?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    allowCopy?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
};

export default function CreateEntryContent({ name, value, css, hexpand = false, allowCopy = false }: EntryContentProps) {
    const valueStr = typeof value === "string" ? value : value?.get() || "";
    function copyToClipboard(text: string) {
        const clipboard = (Gdk.Display.get_default()?.get_clipboard() as Gdk.Clipboard | null);
        if (clipboard && text) {
            clipboard.set_content(Gdk.ContentProvider.new_for_value(text));
        }
    }
    return (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={1.5} hexpand={hexpand}>
            {allowCopy && (
                <Gtk.GestureClick onPressed={() => { copyToClipboard(valueStr); }} />
            )}
            <label label={`${name}:`} css={css} halign={Gtk.Align.START} />
            <label cssClasses={["value", "start-animation", allowCopy ? "copyable" : ""]} css={css} label={valueStr} halign={Gtk.Align.START} wrap wrapMode={Gtk.WrapMode.CHAR} cursor={allowCopy ? Gdk.Cursor.new_from_name("pointer", null) : undefined} />
        </box>
    )
}
