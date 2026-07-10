import { createState, With } from "ags";
import { Gtk } from "ags/gtk4"
import { execAsync } from "ags/process";
import Gio from "gi://Gio";
import { readJson } from "../helper/json";
import { Align, HOME_DIR, WALLPAPER_JSON } from "../helper/constants";
import { monitorFile } from "ags/file";

type Props = { $type: string | undefined; }
interface WallpaperConfig { path: string; }

export function callbackGetWallpaper(res: (response: any) => void) {
  const fallback: WallpaperConfig = { path: "" };
  const wallpaperObj = readJson<WallpaperConfig>(WALLPAPER_JSON, fallback);
  res(wallpaperObj?.path ?? "");
}

export default function Wallpaper({ $type }: Props) {
  const constPath = readJson<{ path: string }>(WALLPAPER_JSON, { path: "" }).path;
  const [wallpaperPath, setWallpaperPath] = createState(constPath);
  execAsync(`dash -c "awww query | sed 's/.*image: //'"`).then((out) => {
    const cleanPath = out.trim();
    execAsync(`ags request "updatewallpaper ${cleanPath}"`);
    setWallpaperPath(cleanPath);
  }).catch(print);

  monitorFile(`${HOME_DIR}/.cache/ags/${WALLPAPER_JSON}`, () => {
    execAsync('ags request "getwallpaperpath"').then(out => { setWallpaperPath(out) })
  })

  return (
    <With value={wallpaperPath}>
      {(v) => v ? (
        <Gtk.Picture $type={$type} contentFit={Gtk.ContentFit.COVER} file={Gio.File.new_for_path(v)} canShrink={true} halign={Align.FILL} valign={Align.FILL} hexpand />
      ) : (<box $type={$type} />)
      }
    </With>
  )
}
