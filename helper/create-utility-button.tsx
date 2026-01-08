import { Accessor } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import giCairo from "cairo";
import { setSourceRGBAFromHex } from "./utility";

type UtilityButtonProps = {
    onClicked?: ((source: Gtk.Button) => void) | undefined
    imageFile: string | Accessor<string> | undefined
    pixelSize?: number | Accessor<number>
    notchSize?: number;
    tooltipText?: string | Accessor<string> | undefined;
};

export default function CreateUtilityButton({onClicked, imageFile, pixelSize = 8, notchSize = 5, tooltipText} : UtilityButtonProps) {
    function drawButtonBackground(area: Gtk.DrawingArea, cr: giCairo.Context, width: number, height: number, notchSize: number) {
        const nSize = notchSize; // Size of the diagonal cut on the top-right

        cr.newPath(); // Start the path
        cr.moveTo(0, 0); // Top-left corner
        cr.lineTo(width - nSize, 0); // Top edge to notch start
        cr.lineTo(width, nSize); // Diagonal notch on top-right
        cr.lineTo(width, height); // Right edge down
        cr.lineTo(0, height); // Bottom edge
        cr.closePath(); // Left edge back to start

        // Fill with background color
        setSourceRGBAFromHex(cr, "#152052", 0.4);
        cr.fillPreserve();

        // Add border
        setSourceRGBAFromHex(cr, "#0B1233", 1);
        cr.setLineWidth(1);
        cr.stroke();
    }

    const padding = 6; // in px
    const minWidth = (typeof pixelSize === 'number' ? pixelSize : pixelSize.get()) + padding;
    const minHeight = (typeof pixelSize === 'number' ? pixelSize : pixelSize.get()) + padding;
    return (
        <button onClicked={onClicked} cssClasses={["clickable"]} cursor={Gdk.Cursor.new_from_name("pointer", null)} tooltipText={tooltipText}>
            <overlay>
                <drawingarea halign={Gtk.Align.FILL} css={`min-width: ${minWidth}px; min-height: ${minHeight}px;`} $={(self) => self.set_draw_func((area, cr, width, height) => drawButtonBackground(area, cr, width, height, notchSize))} />
                <box $type="overlay" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                    <image file={imageFile} pixelSize={pixelSize} />
                </box>
            </overlay>
        </button>
    )
}