import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib"
import Gio from "gi://Gio"
import Wallpaper from "../modules/wallpaper"

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
                const exec = keyfile.get_string("Desktop Entry", "Exec");
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
    const apps = parseDesktopFiles(desktopDir);

    return (
        <box cssClasses={["screen"]} hexpand={false} halign={Gtk.Align.FILL} vexpand={true}>
            <overlay>
                <Wallpaper $type="overlay"/>
                <Gtk.Grid 
                    $type="overlay" 
                    cssClasses={["app-grid"]} 
                    columnSpacing={10} 
                    rowSpacing={10} 
                    css="padding: 20px;" 
                    halign={Gtk.Align.START} 
                    valign={Gtk.Align.START}
                    $={(grid) => {
                        const cols = 10;
                        apps.forEach((app, i) => {
                            const row = Math.floor(i / cols);
                            const col = i % cols;
                            
                            const btn = new Gtk.Button() as any;
                            btn.set_child(
                                <box 
                                    cssClasses={["app-icon"]} 
                                    orientation={Gtk.Orientation.VERTICAL}
                                    spacing={5}
                                >
                                    {app.icon && (
                                        <Gtk.Image 
                                            iconName={app.icon} 
                                            pixelSize={48}
                                        />
                                    )}
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
            </overlay>
        </box>
    )
}