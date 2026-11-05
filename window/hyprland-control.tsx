import app from "ags/gtk4/app"
import style from "../style.scss"
import { Astal, Gdk, Gtk } from "ags/gtk4"
import HyprlandControl from "../card/control-center/hyprland-control"

const windowWidth = 360

function HyprlandControlWindow() {
    function close() {
        app.quit()
    }

    return (
        <window visible
            name="hyprland-control"
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.IGNORE}
            default_width={windowWidth}
            application={app}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
            keymode={Astal.Keymode.ON_DEMAND}
            marginTop={10}
            marginRight={10}
            namespace={"hyprland-control"}>
            <Gtk.EventControllerKey onKeyPressed={(_widget, keyval: number) => {
                if (keyval === Gdk.KEY_Escape) close()
            }} />
            <box cssClasses={["card"]} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                    <HyprlandControl />
                </box>
            </box>
        </window>
    )
}

app.start({
    instanceName: "hyprland-control",
    css: style,
    main() {
        HyprlandControlWindow()
    },
})
