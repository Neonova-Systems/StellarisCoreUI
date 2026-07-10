import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio";
import { readJson } from "../helper/json";
import { Align, WALLPAPER_JSON } from "../helper/constants";
import { interval } from "ags/time";

type Props = {
  $type: string | undefined;
}
export default function Wallpaper({ $type }: Props) {
  const constPath = readJson<{ path: string }>(WALLPAPER_JSON, { path: "" }).path;
  const [wallpaperPath, setWallpaperPath] = createState(constPath);
  execAsync(`dash -c "awww query | sed 's/.*image: //'"`).then((out) => {
    const cleanPath = out.trim();
    execAsync(`ags request "updateWallpaper ${cleanPath}"`);
    setWallpaperPath(cleanPath);
  }).catch(print);
  // interval(1000, () => { execAsync('ags request "get wallpaper path"').then(out => { setWallpaperPath(out) }) });

  return (
    <With value={wallpaperPath}>
      {(v) => v ? (
        <Gtk.Picture $type={$type} contentFit={Gtk.ContentFit.COVER} file={Gio.File.new_for_path(v)} canShrink={true} halign={Align.FILL} valign={Align.FILL} hexpand />
      ) : (<box $type={$type} />)
      }
    </With>
  )
}
