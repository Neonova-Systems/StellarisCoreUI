import { Gdk, Gtk } from "ags/gtk4"
import { Accessor } from "ags"
import { AudioFile, copyToClipboard, playSound } from "./utility";
import Pango from "gi://Pango";
import { Align, HOME_DIR } from "./constants";

type EntryContentProps = {
    name?: string | Accessor<string> | undefined;
    value?: string | Accessor<string> | undefined;
    css?: string | Accessor<string> | undefined;
    hexpand?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    allowCopy?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    animation?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    useMarkup?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    orientation?: Gtk.Orientation | Accessor<NonNullable<Gtk.Orientation | undefined>> | undefined
    ellipsize?: Pango.EllipsizeMode | Accessor<NonNullable<Pango.EllipsizeMode | undefined>> | undefined
    children?: JSX.Element | Array<JSX.Element>
    important?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
};

export default function CreateEntryContent({ name, value, css, hexpand = false, allowCopy = false, animation = true, useMarkup = false, orientation = Gtk.Orientation.VERTICAL, ellipsize, important = false, children}: EntryContentProps) {
    const valueStr = typeof value === "string" ? value : value?.get() || "";
    return (
        <box orientation={orientation} spacing={orientation == Gtk.Orientation.VERTICAL ? 1.5 : 3.0} hexpand={hexpand}>
            {allowCopy && (
                <>
                <Gtk.EventControllerMotion onEnter={() => playSound(AudioFile.Key)} />
                <Gtk.GestureClick onPressed={() => { copyToClipboard(valueStr); }} />
                </>
            )}
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={2} halign={Align.FILL} valign={Align.CENTER}>
                {important && ( <image cssClasses={["filter-bright"]} file={`${HOME_DIR}/.config/ags/assets/ornament5.svg`} pixelSize={9} valign={Align.CENTER} halign={Align.LEFT} /> )}
                <label label={`${name}:`} css={css} halign={Align.LEFT} cssClasses={[animation ?"alt-start-animation" : ""]} valign={Align.CENTER}/>
            </box>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} halign={Align.FILL} valign={Align.LEFT}>
                {children}
                <label 
                    useMarkup={useMarkup} 
                    cssClasses={["value", animation ? "start-animation" : "", allowCopy ? "copyable" : ""]} 
                    css={css} 
                    label={valueStr} 
                    halign={Align.LEFT} 
                    valign={Align.LEFT}
                    wrap 
                    wrapMode={Gtk.WrapMode.CHAR} 
                    ellipsize={ellipsize}
                    cursor={allowCopy ? Gdk.Cursor.new_from_name("pointer", null) : undefined} hexpand />
            </box>
        </box>
    )
}