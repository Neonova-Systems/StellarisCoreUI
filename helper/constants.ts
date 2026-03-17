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
 * `LEFT`/`RIGHT` are horizontal aliases and `TOP`/`BOTTOM` are vertical
 * aliases that map to the same GTK `START`/`END` constants.
 *
 * @property FILL Stretch to fill available space.
 * @property CENTER Center inside available space.
 * @property LEFT Align to the start edge (left in halign).
 * @property TOP Align to the start edge (top in valign).
 * @property RIGHT Align to the end edge (right in halign).
 * @property BOTTOM Align to the end edge (bottom in valign).
 * @property BASELINE Align according to text baseline.
 * @property BASELINE_FILL Fill available space while preserving baseline alignment behavior.
 * @property BASELINE_CENTER Center while preserving baseline alignment behavior.
 * @remarks
 * This is an object (not a TypeScript enum) so each value keeps `Gtk.Align`
 * type compatibility when passed to GTK props like `halign` and `valign`.
 */
export const Align: Record<
    "FILL" | "CENTER" | "LEFT" | "RIGHT" | "TOP" | "BOTTOM" | "BASELINE" | "BASELINE_FILL" | "BASELINE_CENTER",
    Gtk.Align
> = {
    FILL: Gtk.Align.FILL,
    CENTER: Gtk.Align.CENTER,
    LEFT: Gtk.Align.START,
    TOP: Gtk.Align.START,
    RIGHT: Gtk.Align.END,
    BOTTOM: Gtk.Align.END,
    BASELINE: Gtk.Align.BASELINE,
    BASELINE_FILL: Gtk.Align.BASELINE_FILL,
    BASELINE_CENTER: Gtk.Align.BASELINE_CENTER,
};