import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio";
import { readJson } from "../helper/json";
import { WALLPAPER_JSON } from "../helper/constants";
import { interval } from "ags/time";

type Props = {
    $type: string | undefined;
}
export default function Wallpaper({ $type } : Props) {
    const [wallpaperPath, setWallpaperPath] = createState(readJson(WALLPAPER_JSON, { path: "" }).path);
    execAsync(`dash -c "swww query | sed 's/.*image: //'"`).then((out) => {
        execAsync(`ags request "updateWallpaper ${out}"`);
        setWallpaperPath(out)
    })
    interval(1000, () => { execAsync('ags request "get wallpaper path"').then(out => { setWallpaperPath(out) })});

    return (
        <With value={wallpaperPath}>
            {(v) => v ? (
                <Gtk.Picture $type={$type} contentFit={Gtk.ContentFit.COVER} file={Gio.File.new_for_path(v)} canShrink={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand />
            ) : ( <box $type={$type} />)
            }
        </With>
    )
}