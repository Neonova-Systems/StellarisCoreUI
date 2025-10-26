import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import style from "../style.scss"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { Accessor, createState, For, With } from 'ags';
import { CreateEntryContent } from "../helper";
import { execAsync } from "ags/process";
import { interval } from "ags/time";

const hyprland = AstalHyprland.get_default();
const pointerX = hyprland.cursorPosition.x;
const pointerY = hyprland.cursorPosition.y;
const menuWidth = 300;
const menuHeight = 200;
const offset = 15;

export default function ContextMenu() {
    const { LEFT, TOP } = Astal.WindowAnchor
    const [user_commands, setUserCommands] = createState([
        { name: "Open terminal", target: "CURRENT-WORKSPACE", command: "spawn-terminal-relative", keybind: "enter", description: "Spawns a terminal at the current workspace."},
        { name: "Resize", target: "CURRENT-WINDOW", command: "resize-current-window", description: "Enter resize submap for the active window."},
        { name: "Move", target: "CURRENT-WINDOW", command: "hyprctl dispatch submap manage-window", description: "Enter move submap for the active window.", keybind: "CTRL + F"},
        { name: "Close", target: "CURRENT-WINDOW", command: "hyprctl kill", keybind: "ctrl + x", description: "Closes the active window."},
        { name: "Toggle floating", target: "CURRENT-WINDOW", command: "", keybind: "ctrl + f", description: "Toggles floating mode for the active window."},
        { name: "Move to the center", target: "CURRENT-WINDOW", command: "", description: "Moves the active window to the center."},
        { name: "Toggle Gaps", target: "GLOBAL-SETTINGS", command: "", description: "Toggles gaps between windows."},
        { name: "Increase Gap", target: "GLOBAL-SETTINGS", command: "", description: "Increases the gap size."},
        { name: "Decrease Gap", target: "GLOBAL-SETTINGS", command: "", description: "Decreases the gap size."},
    ])
    const [displayMode, setDisplayMode] = createState<"target" | "description">("target");
    interval(6000, () => { setDisplayMode(current => current === "target" ? "description" : "target") });
    return ( <window visible
        name="ContextMenu"
        layer={Astal.Layer.TOP}
        exclusivity={Astal.Exclusivity.NORMAL}
        default_width={menuWidth}
        default_height={menuHeight}
        application={app}
        anchor={ LEFT | TOP }
        marginLeft={pointerX}
        margin_top={pointerY}
        keymode={Astal.Keymode.ON_DEMAND}
        namespace={"context-menu"}>
        <Gtk.EventControllerKey onKeyPressed={(widget, keyval: number, keycode: number, state: Gdk.ModifierType) => {
            if (keyval === Gdk.KEY_Escape) {
                const w = app.get_window?.("ContextMenu")
                if (w) { w.destroy() }
                app.quit()
                return;
            }

            let key;
            (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) 
                ? key = "enter" 
                : key = String.fromCharCode(Gdk.keyval_to_lower(keyval));
            if (!key) return;

            const modifiers = [];
            if (state & Gdk.ModifierType.CONTROL_MASK) modifiers.push("ctrl");
            if (state & Gdk.ModifierType.SHIFT_MASK) modifiers.push("shift");
            if (state & Gdk.ModifierType.ALT_MASK) modifiers.push("alt"); // Alt key

            const pressedKeybind = [...modifiers, key].join(" + ");
            print(pressedKeybind)

            const command = user_commands.get().find(c => c.keybind?.toLowerCase() === pressedKeybind);
            if (command && command.command) {
                execAsync(command.command);
                const w = app.get_window?.("ContextMenu")
                if (w) { w.destroy() }
                app.quit()
            }
        }} />
        <box cssClasses={["context-menu", "shadow"]} css={`margin: 5px;`} orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 7px;`} hexpand homogeneous={false} spacing={7}>
                <For each={user_commands} >
                    {(command: any, index) => (
                        <button onClicked={() => execAsync(`zsh -ic "${command.command}"`)}>
                            <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} spacing={3}>
                                <box orientation={Gtk.Orientation.HORIZONTAL} homogeneous={false}>
                                    <label cssClasses={["title"]} label={command.name} halign={Gtk.Align.START} hexpand />
                                    {command.keybind && (<label cssClasses={["keybind"]} label={command.keybind} halign={Gtk.Align.START} />)}
                                </box>
                                <With value={displayMode}>
                                    {(value) => value === "target" ? <CreateEntryContent name={"TARGET"} value={command.target} orientation={Gtk.Orientation.HORIZONTAL} />
                                        : <CreateEntryContent name={"DESC"} value={command.description} css={`text-transform: uppercase;`} orientation={Gtk.Orientation.HORIZONTAL} />
                                    }
                                </With>
                            </box>
                        </button>
                    )}
                </For>
            </box>
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