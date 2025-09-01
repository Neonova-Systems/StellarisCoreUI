import { Gtk } from "ags/gtk4"
import { Accessor } from "ags"

type EntryContentProps = {
    name?: string | Accessor<string> | undefined;
    value?: string | Accessor<string> | undefined;
    css?: string | Accessor<string> | undefined;
    hexpand?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
};

export default function CreateEntryContent({ name, value, css, hexpand = false}: EntryContentProps) {
    return (
        <box orientation={Gtk.Orientation.VERTICAL} spacing={1.5} hexpand={hexpand}>
            <label label={`${name}:`} css={css} halign={Gtk.Align.START} />
            <label cssClasses={["value", "start-animation"]} css={css} label={value} halign={Gtk.Align.START} wrap wrapMode={Gtk.WrapMode.CHAR}/>
        </box>
    )
}
