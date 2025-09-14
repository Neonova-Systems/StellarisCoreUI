import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio";
import { readJson } from "../helper/json";
import { WALLPAPER_JSON } from "../helper/constants";

export default function Wallpaper() {
    const [wallpaperPath, setWallpaperPath] = createState(readJson(WALLPAPER_JSON, { path: "" }).path);
    execAsync(`dash -c "swww query | sed 's/.*image: //'"`).then((out) => {
        execAsync(`ags request "updateWallpaper ${out}"`);
        setWallpaperPath(out)
    })
    return (
        <With value={wallpaperPath}>
            {(v) => v ? (
                <Gtk.Picture contentFit={Gtk.ContentFit.COVER} file={Gio.File.new_for_path(v)} canShrink={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand />
            ) : ( <box />)
            }
        </With>
    )
}