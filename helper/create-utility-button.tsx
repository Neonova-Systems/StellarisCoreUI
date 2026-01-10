import { Accessor } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import { Corner, drawChamferedButton } from "./draw-function";

type UtilityButtonProps = {
    onClicked?: ((source: Gtk.Button) => void) | undefined
    imageFile: string | Accessor<string> | undefined
    pixelSize?: number | Accessor<number>
    notchSize?: number;
    tooltipText?: string | Accessor<string> | undefined;
};

export default function CreateUtilityButton({onClicked, imageFile, pixelSize = 8, notchSize = 5, tooltipText} : UtilityButtonProps) {
    const padding = 6; // in px
    const minWidth = (typeof pixelSize === 'number' ? pixelSize : pixelSize.get()) + padding;
    const minHeight = (typeof pixelSize === 'number' ? pixelSize : pixelSize.get()) + padding;
    return (
        <button onClicked={onClicked} cssClasses={["clickable"]} cursor={Gdk.Cursor.new_from_name("pointer", null)} tooltipText={tooltipText}>
            <overlay>
                <drawingarea halign={Gtk.Align.FILL} css={`min-width: ${minWidth}px; min-height: ${minHeight}px;`} $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedButton({area, cr, width, height, notchPlacements: [{corner: Corner.TopRight}], notchSize}))} />
                <box $type="overlay" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                    <image file={imageFile} pixelSize={pixelSize} />
                </box>
            </overlay>
        </button>
    )
}