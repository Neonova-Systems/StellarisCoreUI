import { Gdk, Gtk } from "ags/gtk4"
import giCairo from "cairo";
import { setSourceRGBAFromHex } from "./utility";

/**
 * Represents the four corners of a rectangle or widget.
 *
 * @enum {number}
 */
export enum Corner {
    TopLeft = 0,
    TopRight = 1,
    BottomRight = 2,
    BottomLeft = 3
}

type Props = { 
    area: Gtk.DrawingArea; 
    cr: giCairo.Context; 
    width: number; 
    height: number; 
    notchSize?: number;
    notchPlacements?: NotchPlacement[];
    backgroundColor?: string;
    backgroundAlpha?: number;
    borderColor?: string;
    borderAlpha?: number;
}

/**
 * Represents the configuration for a notch on a specific corner of a widget.
 *
 * @interface NotchPlacement
 * @property {Corner} corner - The corner where the notch is located.
 * @property {number} [size] - Optional override for the notch size for this specific corner. If omitted, a default size is used.
 */
interface NotchPlacement {
    corner: Corner;
    size?: number; // Optional override for notchSize per corner
}

/**
 * Draws a rectangular button with chamfered (notched) corners on a Cairo context.
 *
 * This function constructs a path for a rectangle, cutting out specified corners
 * to create a chamfered effect. It then fills the shape with a specified background
 * color and alpha, and strokes it with a border color and alpha.
 *
 * @param {object} props - The properties for drawing the button.
 * @param {Gtk.DrawingArea} props.area - The drawing area widget (Note: not directly used in this function but expected in the props object).
 * @param {Cairo.Context} props.cr - The Cairo drawing context to draw on.
 * @param {number} props.width - The width of the button.
 * @param {number} props.height - The height of the button.
 * @param {number} [props.notchSize=10] - The default size for the chamfered corners. This is used for any corner specified in `notchPlacements` that doesn't have its own size.
 * @param {Array<object>} [props.notchPlacements=[{ corner: Corner.BottomRight }]] - An array of objects specifying which corners to notch. Each object must have a `corner` property (Corner enum) and can optionally have a `size` property to override the default `notchSize`.
 * @param {string} [props.backgroundColor="#152052"] - The hex color code for the button's background fill.
 * @param {number} [props.backgroundAlpha=0.4] - The alpha (opacity) for the background, from 0.0 to 1.0.
 * @param {string} [props.borderColor="#0B1233"] - The hex color code for the button's border.
 * @param {number} [props.borderAlpha=1.0] - The alpha (opacity) for the border, from 0.0 to 1.0.
 * @returns {void}
 *
 * @example
 * // In a Gtk.DrawingArea 'draw' signal handler:
 * const width = area.get_allocated_width();
 * const height = area.get_allocated_height();
 *
 * drawChamferedButton({
 *   area,
 *   cr,
 *   width,
 *   height,
 *   notchPlacements: [
 *     { corner: Corner.TopLeft },
 *     { corner: Corner.BottomRight, size: 20 }
 *   ],
 *   backgroundColor: '#2A3B7B',
 *   borderColor: '#FFFFFF'
 * });
 */
export function drawChamferedButton({ area, cr, width, height, notchSize = 10, notchPlacements = [{ corner: Corner.BottomRight }], backgroundColor = "#152052", backgroundAlpha = 0.4, borderColor = "#0B1233", borderAlpha = 1.0}: Props): void {
    const getNotchSize = (corner: Corner): number => {
        const placement = notchPlacements.find(p => p.corner === corner);
        return placement?.size ?? notchSize;
    };

    const hasNotch = (corner: Corner): boolean => {
        return notchPlacements.some(p => p.corner === corner);
    };

    cr.newPath();

    // Top-left corner
    if (hasNotch(Corner.TopLeft)) {
        const size = getNotchSize(Corner.TopLeft);
        cr.moveTo(size, 0);
        cr.lineTo(0, size);
    } else {
        cr.moveTo(0, 0);
    }

    // Top edge and top-right corner
    if (hasNotch(Corner.TopRight)) {
        const size = getNotchSize(Corner.TopRight);
        cr.lineTo(width - size, 0);
        cr.lineTo(width, size);
    } else {
        cr.lineTo(width, 0);
    }

    // Right edge and bottom-right corner
    if (hasNotch(Corner.BottomRight)) {
        const size = getNotchSize(Corner.BottomRight);
        cr.lineTo(width, height - size);
        cr.lineTo(width - size, height);
    } else {
        cr.lineTo(width, height);
    }

    // Bottom edge and bottom-left corner
    if (hasNotch(Corner.BottomLeft)) {
        const size = getNotchSize(Corner.BottomLeft);
        cr.lineTo(size, height);
        cr.lineTo(0, height - size);
    } else {
        cr.lineTo(0, height);
    }

    cr.closePath();

    setSourceRGBAFromHex(cr, backgroundColor, backgroundAlpha); // Fill with background color
    cr.fillPreserve();

    setSourceRGBAFromHex(cr, borderColor, borderAlpha); // Add border
    cr.setLineWidth(1);
    cr.stroke();
}