import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import style from "../style.scss"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { Accessor, createState, For } from "ags";

const hyprland = AstalHyprland.get_default();
const pointerX = hyprland.cursorPosition.x;
const pointerY = hyprland.cursorPosition.y;
const menuWidth = 300;
const menuHeight = 200;
const offset = 15;

export default function ContextMenu() {
    const { LEFT, TOP } = Astal.WindowAnchor
    const [user_commands, setUserCommands] = createState([
        { name: "Open terminal", target: "-", command: ""},
        { name: "Resize", target: "current window", command: ""},
        { name: "Move", target: "current-window", command: ""},
        { name: "Close", target: "current-window", command: ""},
        { name: "Toggle floating mode", target: "current-window", command: ""},
        { name: "Move to the center", target: "current-window", command: ""},
        { name: "Toggle Gaps", target: "global-settings", command: ""},
        { name: "Increase Gap", target: "global-settings", command: ""},
        { name: "Decrease Gap", target: "global-settings", command: ""},
    ])
    return ( <window visible
        name="ContextMenu"
        layer={Astal.Layer.TOP}
        cssClasses={["contextmenu"]}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={menuWidth}
        default_height={menuHeight}
        application={app}
        anchor={ LEFT | TOP }
        marginLeft={pointerX}
        margin_top={pointerY}
        namespace={"context-menu"}>
        <box cssClasses={["debug", "context-menu"]} orientation={Gtk.Orientation.VERTICAL}>
            <For each={user_commands} >
                {(command: any, index) => (
                    <box cssClasses={["shadow"]} orientation={Gtk.Orientation.VERTICAL}>
                        <label label={command.name} />
                        <label label={command.target} />
                    </box>
                )}
            </For>
        </box>
    </window>
    )
}

app.start({
    instanceName: "context-menu",
    gtkTheme: "adw-gtk3-dark",
    css: style,
    main() {
       ContextMenu()
       const poll = setInterval(() => {
        try {
            const pos = hyprland.cursorPosition;
            const windowWIdth = app.get_window?.("ContextMenu")?.get_width() || menuWidth;
            const windowHeight = app.get_window?.("ContextMenu")?.get_height() || menuHeight;
            if(!pos) return
            if (
                pos.x < pointerX - offset ||
                pos.x > pointerX + windowWIdth + offset ||
                pos.y < pointerY - offset ||
                pos.y > pointerY + windowHeight + offset
            ) {
                const w = app.get_window?.("ContextMenu")
                if (w) { w.destroy() }
                clearInterval(poll)
                app.quit()
            }
        } catch (e) {
            clearInterval(poll)
        }
       }, 200)
    },
})