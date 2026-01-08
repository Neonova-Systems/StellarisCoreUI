import { Gdk, Gtk } from "ags/gtk4"
import { Accessor } from "ags"
import { copyToClipboard, playGrantedSound, playKeySound } from "./utility";
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
    children?: JSX.Element | Array<JSX.Element>
};

export default function CreateEntryContent({ name, value, css, hexpand = false, allowCopy = false, useMarkup = false, orientation = Gtk.Orientation.VERTICAL, ellipsize, children}: EntryContentProps) {
    const valueStr = typeof value === "string" ? value : value?.get() || "";
    return (
        <box orientation={orientation} spacing={orientation == Gtk.Orientation.VERTICAL ? 1.5 : 3.0} hexpand={hexpand}>
            {allowCopy && (
                <>
                <Gtk.EventControllerMotion onEnter={() => playKeySound()} />
                <Gtk.GestureClick onPressed={() => { copyToClipboard(valueStr); }} />
                </>
            )}
            <label label={`${name}:`} css={css} halign={Gtk.Align.START} cssClasses={["alt-start-animation"]}/>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} halign={Gtk.Align.FILL} valign={Gtk.Align.START}>
                {children}
                <label 
                    useMarkup={useMarkup} 
                    cssClasses={["value", "start-animation", allowCopy ? "copyable" : ""]} 
                    css={css} 
                    label={valueStr} 
                    halign={Gtk.Align.START} 
                    valign={Gtk.Align.START}
                    wrap 
                    wrapMode={Gtk.WrapMode.CHAR} 
                    ellipsize={ellipsize}
                    cursor={allowCopy ? Gdk.Cursor.new_from_name("pointer", null) : undefined} hexpand />
            </box>
        </box>
    )
}