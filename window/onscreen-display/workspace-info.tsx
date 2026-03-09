import app from "ags/gtk4/app";
import style from "./style.scss";
import { Astal, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Corner, drawChamferedBackground } from "../../helper/draw-function";
import Adw from "gi://Adw?version=1";
import Gio from "gi://Gio?version=2.0";
import { HOME_DIR } from "../../helper";

const hyprland = AstalHyprland.get_default();

function OSD() {
    const focusedWorkspace_has_fullscreen = hyprland.focusedWorkspace.has_fullscreen;
    return ( <window visible
        name="workspace-info-osd"
        layer={focusedWorkspace_has_fullscreen ? Astal.Layer.OVERLAY : Astal.Layer.TOP}
        exclusivity={focusedWorkspace_has_fullscreen ? Astal.Exclusivity.IGNORE : Astal.Exclusivity.NORMAL}
        default_width={256}
        default_height={63}
        application={app}
        anchor={Astal.WindowAnchor.TOP}
        keymode={Astal.Keymode.ON_DEMAND}
        namespace={"workspace-info-osd"}>
        <box cssClasses={["onscreen-display"]} valign={Gtk.Align.FILL} vexpand>
            <overlay>
                <box>
                    <drawingarea halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, notchSize: 20, backgroundColor: "#070B1F", backgroundAlpha: 1.0, borderAlpha: 1.0, borderColor: "#0A102E", notchPlacements: [{corner: Corner.BottomLeft}, {corner: Corner.BottomRight}], }))} />
                </box>
                <box cssClasses={["contents"]} $type="overlay">
                    <overlay>
                        <box hexpand />
                        <box $type="overlay" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
                            <label label={`${hyprland.focusedWorkspace.id}`} cssClasses={["id"]} />
                            <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
                                <label halign={Gtk.Align.START} label={`WORKSPACE [${hyprland.focusedWorkspace.name}] IN USE`} />
                                <label halign={Gtk.Align.START} label={`${hyprland.focusedWorkspace.get_clients().length} CLIENTS`} />
                            </box>
                        </box>
                        <label halign={Gtk.Align.CENTER} valign={Gtk.Align.START} $type="overlay" cssClasses={['monitor']} label={`${hyprland.focusedWorkspace.monitor.name} ${hyprland.focusedWorkspace.monitor.width}x${hyprland.focusedWorkspace.monitor.height}@${hyprland.focusedWorkspace.monitor.refreshRate}Hz`}/>
                        <label cssClasses={["decoration-text", "uppercase"]} $type="overlay" label={"Igne Natura Renovatur Integra"} marginBottom={4} marginEnd={20} valign={Gtk.Align.END} halign={Gtk.Align.END}/>
                        <label cssClasses={["decoration-text", "uppercase"]} $type="overlay" label={"Igne Natura Renovatur Integra"} marginBottom={4} marginEnd={20} valign={Gtk.Align.END} halign={Gtk.Align.END}/>
                        <Adw.Clamp maximumSize={13} $type="overlay" marginEnd={7} marginTop={5} valign={Gtk.Align.START} halign={Gtk.Align.END}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/Thumbnails-88.png`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                        </Adw.Clamp>
                        <Adw.Clamp maximumSize={13} $type="overlay" marginStart={6} marginTop={5} valign={Gtk.Align.START} halign={Gtk.Align.START}>
                            <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/Thumbnails-89.png`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
                        </Adw.Clamp>
                        <Adw.Clamp maximumSize={25} $type="overlay" marginStart={20} marginBottom={4} valign={Gtk.Align.END} halign={Gtk.Align.START}>
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
        return OSD()
    },
})