import app from "ags/gtk4/app";
import style from "./style.scss";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Corner, drawChamferedBackground } from "../../helper/draw-function";
import Adw from "gi://Adw?version=1";
import Gio from "gi://Gio?version=2.0";
import { Align, AudioFile, HOME_DIR, playSound } from "../../helper";
import { timeout } from "ags/time";
import GLib from "gi://GLib?version=2.0";

const hyprland = AstalHyprland.get_default();

function OSD() {
    const focusedWorkspace = hyprland.focusedWorkspace;
    const monitor = focusedWorkspace.monitor;
    const workspaceId = `${focusedWorkspace.id}`;
    const workspaceName = `${focusedWorkspace.name}`;
    const workspaceWindows = `${focusedWorkspace.get_clients().length}`;
    const workspaceMonitor = `${monitor.name}`;
    const focusedWorkspace_has_fullscreen = (focusedWorkspace.has_fullscreen ? "1" : "0") === "1";
    const previousWorkspaceId = GLib.getenv("HYPRLAND_PREVIOUS_WORKSPACE_ID") ?? "0";

    return ( <window visible
        name="workspace-info-osd"
        layer={focusedWorkspace_has_fullscreen ? Astal.Layer.OVERLAY : Astal.Layer.TOP}
        exclusivity={focusedWorkspace_has_fullscreen ? Astal.Exclusivity.IGNORE : Astal.Exclusivity.NORMAL}
        default_width={256}
        default_height={66}
        application={app}
        anchor={Astal.WindowAnchor.TOP}
        keymode={Astal.Keymode.NONE}
        namespace={"workspace-info-osd"}>
        <box cssClasses={["onscreen-display"]} valign={Align.FILL} vexpand cursor={Gdk.Cursor.new_from_name("pointer", null)}>
            <Gtk.GestureClick onPressed={() => { app.quit() }} />
            { focusedWorkspace_has_fullscreen && <Gtk.DropControllerMotion onEnter={() => hyprland.get_workspace(parseInt(previousWorkspaceId)).focus() } /> }
            <overlay>
                <box>
                    <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, notchSize: 20, backgroundColor: (focusedWorkspace_has_fullscreen ? "#050713" : "#070B1F"), backgroundAlpha: 1.0, borderAlpha: 1.0, borderSize: (focusedWorkspace_has_fullscreen ? 3 : 1), borderColor: "#0A102E", notchPlacements: [{corner: Corner.BottomLeft}, {corner: Corner.BottomRight}], }))} />
                </box>
                <box cssClasses={["contents"]} $type="overlay">
                    <overlay>
                        <box hexpand />
                        <box $type="overlay" halign={Align.CENTER} valign={Align.CENTER} marginTop={5} spacing={5}>
                            <box spacing={3}>
                                <label valign={Align.LEFT} marginTop={7} label={previousWorkspaceId} cssClasses={["prev-id"]}/>
                                <label label={workspaceId} cssClasses={["id"]} />
                            </box>
                            <box orientation={Gtk.Orientation.VERTICAL} valign={Align.CENTER}>
                                <label halign={Align.LEFT} label={`WORKSPACE [${workspaceName}] IN USE`} />
                                <label halign={Align.LEFT} label={`${workspaceWindows} CLIENTS`} />
                            </box>
                        </box>
                        <label halign={Align.CENTER} valign={Align.LEFT} $type="overlay" marginTop={3} cssClasses={['monitor']} label={`${workspaceMonitor} ${monitor.width}x${monitor.height}@${monitor.refreshRate}Hz`}/>
                        <label cssClasses={["decoration-text", "uppercase"]} $type="overlay" label={"Igne Natura Renovatur Integra"} marginBottom={4} marginEnd={20} valign={Align.RIGHT} halign={Align.RIGHT}/>
                        {focusedWorkspace_has_fullscreen &&
                            <Adw.Clamp maximumSize={9} $type="overlay" marginStart={7} marginTop={23} valign={Align.TOP} halign={Align.LEFT}>
                                <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/icon/streamline--dangerous-zone-sign-remix.svg`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                            </Adw.Clamp>
                        }
                        <Adw.Clamp maximumSize={11} $type="overlay" marginEnd={7} marginTop={25} valign={Align.TOP} halign={Align.RIGHT}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/icon/ic--round-ads-click.svg`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                        </Adw.Clamp>
                        <Adw.Clamp maximumSize={13} $type="overlay" marginEnd={7} marginTop={3} valign={Align.LEFT} halign={Align.RIGHT}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/Thumbnails-88.png`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                        </Adw.Clamp>
                        <Adw.Clamp maximumSize={13} $type="overlay" marginStart={6} marginTop={3} valign={Align.LEFT} halign={Align.LEFT}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/Thumbnails-89.png`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                        </Adw.Clamp>
                        <Adw.Clamp maximumSize={25} $type="overlay" marginStart={20} marginBottom={4} valign={Align.RIGHT} halign={Align.LEFT}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/Thumbnails-226.png`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                        </Adw.Clamp>
                    </overlay>
                </box>
            </overlay>
        </box>
    </window>
    )
}

app.start({
    instanceName: "workspace-info-osd",
    css: style,
    main() { 
        OSD();
        timeout(1533, () => { app.quit() });
    },
})