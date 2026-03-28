import { Gdk, Gtk } from "ags/gtk4"
import { Accessor, With } from "ags"
import { AudioFile, copyToClipboard, playSound } from "./utility";
import Pango from "gi://Pango";
import { Align, HOME_DIR } from "./constants";

type EntryContentProps = {
    name?: string | Accessor<string> | undefined;
    value?: string | number | Accessor<string | number> | undefined;
    css?: string | Accessor<string> | undefined;
    hexpand?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    vexpand?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    allowCopy?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    animation?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    useMarkup?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    orientation?: Gtk.Orientation | Accessor<NonNullable<Gtk.Orientation | undefined>> | undefined
    ellipsize?: Pango.EllipsizeMode | Accessor<NonNullable<Pango.EllipsizeMode | undefined>> | undefined
    children?: JSX.Element | Array<JSX.Element>
    important?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    watchValue?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
    addPercentSuffix?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined
};

/**
 * Displays a labeled entry with a reactive value display
 * 
 * Creates a two-row layout: name label on top, value label below. Supports reactive state binding,
 * copy-to-clipboard functionality, animations, and optional dynamic value updates.
 * 
 * @param props - Component configuration
 * @param props.name - Display label text (shown with colon). Can be static string or reactive {@link Accessor}
 * @param props.value - Text or number to display. Supports static values and reactive {@link Accessor}s with automatic tracking
 * @param props.css - CSS string applied to both labels. Can be static or reactive
 * @param props.hexpand - Horizontal expansion flag. Default: `false`
 * @param props.allowCopy - Enable copy-to-clipboard on value click. Plays sound feedback. Default: `false`
 * @param props.animation - Apply entrance animations to labels. Default: `true`
 * @param props.useMarkup - Enable Pango markup in value label. Default: `false`
 * @param props.orientation - Layout direction: `VERTICAL` (name→value) or `HORIZONTAL`. Default: `VERTICAL`
 * @param props.ellipsize - Text truncation mode for long values. Uses {@link Pango.EllipsizeMode}. Default: `undefined` (no truncation)
 * @param props.children - Additional JSX elements rendered alongside value label
 * @param props.important - Show decorative ornament image before name. Default: `false`
 * @param props.watchValue - Wrap value in `<With>` component for reactive updates when passed {@link Accessor}. Default: `false`
 * @param props.addPercentSuffix - Append "%" character to value label output. Default: `false`
 * 
 * @returns JSX box element with labeled entry content
 * 
 * @example
 * // Static display
 * <CreateEntryContent name="Volume" value="50%" animation={true} />
 * 
 * @example
 * // Reactive with copy support
 * const [deviceName, setDeviceName] = createState("Device A")
 * <CreateEntryContent 
 *   name="Device" 
 *   value={deviceName} 
 *   watchValue 
 *   allowCopy 
 * />
 * 
 * @example
 * // With percentage suffix
 * const [volume, setVolume] = createState(75)
 * <CreateEntryContent 
 *   name="Speaker" 
 *   value={volume} 
 *   watchValue 
 *   addPercentSuffix
 * />
 */
export default function CreateEntryContent({ name, value, css, hexpand = false, vexpand = false, allowCopy = false, animation = true, useMarkup = false, orientation = Gtk.Orientation.VERTICAL, ellipsize, important = false, watchValue = false, addPercentSuffix = false, children}: EntryContentProps) {
    const valueStr = typeof value === "string" ? value : typeof value === "number" ? String(value) : value?.peek() || "";
    const valueLabel = (labelValue: string | number) => (
        <label 
            useMarkup={useMarkup} 
            cssClasses={["value", animation ? "start-animation" : "", allowCopy ? "copyable" : ""]} 
            css={css} 
            label={String(labelValue) + (addPercentSuffix ? "%" : "")} 
            halign={Align.LEFT} 
            valign={Align.LEFT}
            wrap 
            wrapMode={Gtk.WrapMode.CHAR} 
            ellipsize={ellipsize}
            cursor={allowCopy ? Gdk.Cursor.new_from_name("pointer", null) : undefined} hexpand />
    )
    
    return (
        <box orientation={orientation} spacing={orientation == Gtk.Orientation.VERTICAL ? 1.5 : 3.0} hexpand={hexpand} vexpand={vexpand}>
            {allowCopy && (
                <>
                <Gtk.EventControllerMotion onEnter={() => playSound(AudioFile.Key)} />
                <Gtk.GestureClick onPressed={() => { copyToClipboard(String(valueStr)); }} />
                </>
            )}
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={2} halign={Align.FILL} valign={Align.CENTER}>
                {important && ( <image cssClasses={["filter-bright"]} file={`${HOME_DIR}/.config/ags/assets/ornament/ornament5.svg`} pixelSize={9} valign={Align.CENTER} halign={Align.LEFT} /> )}
                <label label={`${name}:`} css={css} halign={Align.LEFT} cssClasses={[animation ?"alt-start-animation" : ""]} valign={Align.CENTER}/>
            </box>
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} halign={Align.FILL} valign={Align.LEFT}>
                {children}
                {watchValue && typeof value !== "string" && typeof value !== "number" && value ? (
                    <With value={value}>
                        {(v) => valueLabel(v)}
                    </With>
                ) : (
                    valueLabel(valueStr)
                )}
            </box>
        </box>
    )
}