import GLib from "gi://GLib?version=2.0";
export const HOME_DIR = GLib.get_home_dir();
export const CACHE_DIR = `${GLib.get_user_cache_dir()}/ags`;
export const WALLPAPER_JSON = "wallpaper.json";
export const DASHBOARD_STATE_JSON = "dashboard-state.json";
