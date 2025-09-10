import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio";

export default function Screen() {
    const [wallpaperPath, setWallpaperPath] = createState("");
    execAsync(`dash -c "swww query | sed 's/.*image: //'"`).then((out) => setWallpaperPath(out))
    return (
        <With value={wallpaperPath}>
            {(v) => v ? (
                <Gtk.Picture contentFit={Gtk.ContentFit.COVER} file={Gio.File.new_for_path(v)} canShrink={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand />
            ) : ( <box />)
            }
        </With>
    )
}