import { Gdk, Gtk } from "ags/gtk4"
import GLib from "gi://GLib"
import Gio from "gi://Gio"
import Wallpaper from "../modules/wallpaper"
import { HOME_DIR, SIGNAL_JSON } from "../helper"
import { execAsync } from "ags/process"
import { createState, For, With } from 'ags';
import { interval } from "ags/time"
import { readJson, writeJson } from '../helper/json';

type DesktopEntry = {
    name: string;
    exec: string;
    icon?: string;
}

function parseDesktopFiles(dir: string): DesktopEntry[] {
    const entries: DesktopEntry[] = [];
    const folder = Gio.File.new_for_path(dir);
    
    try {
        const enumerator = folder.enumerate_children(
            "standard::name,standard::type",
            Gio.FileQueryInfoFlags.NONE,
            null
        );
        
        let info;
        while ((info = enumerator.next_file(null)) !== null) {
            const filename = info.get_name();
            if (!filename.endsWith(".desktop")) continue;
            
            const filepath = GLib.build_filenamev([dir, filename]);
            const keyfile = new GLib.KeyFile();
            
            try {
                keyfile.load_from_file(filepath, GLib.KeyFileFlags.NONE);
                const name = keyfile.get_string("Desktop Entry", "Name");
                let exec = keyfile.get_string("Desktop Entry", "Exec");
                
                // Strip field codes like %u, %U, %f, %F, %i, %c, %k
                exec = exec.replace(/%[uUfFick]/g, '').trim();
                
                let icon: string | undefined;
                try {
                    icon = keyfile.get_string("Desktop Entry", "Icon");
                } catch {
                    icon = undefined;
                }
                
                entries.push({ name, exec, icon });
            } catch (e) {
                console.error(`Failed to parse ${filename}:`, e);
            }
        }
    } catch (e) {
        console.error(`Failed to read directory ${dir}:`, e);
    }
    
    return entries;
}

export default function Screen() {
    const desktopDir = GLib.build_filenamev([GLib.get_home_dir(), "Desktop"]);
    const [toggleDesktopIconState, setToggleDesktopIconState] = createState(false);
    const [listApps, setListApps] = createState<DesktopEntry[]>([]);

    setListApps(parseDesktopFiles(desktopDir));
    interval(800, () => { execAsync('ags request "getDesktopIconsState"').then(out => {
            const enabled = out === 'true';
            setToggleDesktopIconState(enabled);
        });
    });
    interval(1000, () => { 
        const signalObj = readJson(SIGNAL_JSON, {})
        if (signalObj !== null && "refreshAppIcon" in signalObj && signalObj.refreshAppIcon === true) {
            setListApps(parseDesktopFiles(desktopDir));
            signalObj.refreshAppIcon = false;
            writeJson(SIGNAL_JSON, signalObj);
        }
    })
    function onRightClicked() {
        execAsync(`ags run ${HOME_DIR}/.config/ags/window/context-menu/desktop-menu.tsx --gtk 4`).catch((e) => print(e))
    }

    return (
        <box cssClasses={["screen"]} hexpand={false} halign={Gtk.Align.FILL} vexpand={true}>
            <Gtk.GestureClick button={3} onPressed={onRightClicked} />
            <overlay>
                <Wallpaper $type="overlay"/>
                <box $type="overlay">
                    <With value={toggleDesktopIconState}>
                        {(v) => (
                            <box visible={v}>
                                <With value={listApps}>
                                    {(apps) => (
                                        <Gtk.Grid css="padding: 20px;" cssClasses={["app-grid"]} columnSpacing={15} rowSpacing={15} halign={Gtk.Align.START} valign={Gtk.Align.START}
                                            $={(grid) => {
                                                const rows = 10;
                                                apps.forEach((app, i) => {
                                                    const col = Math.floor(i / rows);
                                                    const row = i % rows;

                                                    const btn = new Gtk.Button() as any;
                                                    btn.set_child(
                                                        <box cssClasses={["app-icon"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
                                                            {app.icon && (<Gtk.Image iconName={app.icon} pixelSize={48} />)}
                                                            <label label={app.name} cssClasses={["app-name"]} />
                                                        </box>
                                                    );
                                                    btn.connect('clicked', () => {
                                                        GLib.spawn_command_line_async(app.exec);
                                                    });

                                                    grid.attach(btn, col, row, 1, 1);
                                                });
                                            }}
                                        />
                                    )}
                                </With>
                            </box>
                        )}
                    </With>
                </box>
            </overlay>
        </box>
    )
}