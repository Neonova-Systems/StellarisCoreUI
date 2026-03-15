import { Gtk } from "ags/gtk4";
import GLib from "gi://GLib?version=2.0";
export const HOME_DIR = GLib.get_home_dir();
export const ICON_DIR = `${HOME_DIR}/.config/ags/assets/icon`;
export const CACHE_DIR = `${GLib.get_user_cache_dir()}/ags`;
export const WALLPAPER_JSON = "wallpaper.json";
export const SIGNAL_JSON = "signal.json";
export const DASHBOARD_STATE_JSON = "dashboard-state.json";
export const DASHBOARD_CARDS_ORDER_JSON = "dashboard-cards-order.json";
export const TOOLTIP_TEXT_CONTEXT_MENU = "Right click to open context menu";

/**
 * Readable alignment aliases for GTK widget alignment.
 *
 * Maps friendly names to `Gtk.Align` values so UI code is easier to scan.
 *
 * @remarks
 * This is an object (not a TypeScript enum) so each value keeps `Gtk.Align`
 * type compatibility when passed to GTK props like `halign` and `valign`.
 */
export const Align: Record<
    "FILL" | "CENTER" | "LEFT" | "RIGHT" | "BASELINE" | "BASELINE_FILL" | "BASELINE_CENTER",
    Gtk.Align
> = {
    /** Stretch to fill available space. */
    FILL: Gtk.Align.FILL,

    /** Center inside available space. */
    CENTER: Gtk.Align.CENTER,

    /** Align to the start edge (left in LTR, top in vertical layout). */
    LEFT: Gtk.Align.START,

    /** Align to the end edge (right in LTR, bottom in vertical layout). */
    RIGHT: Gtk.Align.END,

    /** Align according to text baseline. */
    BASELINE: Gtk.Align.BASELINE,

    /** Fill available space while preserving baseline alignment behavior. */
    BASELINE_FILL: Gtk.Align.BASELINE_FILL,

    /** Center while preserving baseline alignment behavior. */
    BASELINE_CENTER: Gtk.Align.BASELINE_CENTER,
};