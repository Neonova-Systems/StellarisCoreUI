import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import style from "../style.scss"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { Accessor, createState, For, With } from 'ags';
import { CreateEntryContent, DeleteWindowOnOutofBound } from "../helper";
import { execAsync } from "ags/process";
import { interval, Timer } from "ags/time";

const hyprland = AstalHyprland.get_default();
const pointerX = hyprland.cursorPosition.x;
const pointerY = hyprland.cursorPosition.y;
const menuWidth = 300;
const menuHeight = 0;

interface CommandItem {
    name: string;
    description?: string;
    command: string;
    keybind?: string;
    target?: string;
}

export function SpawnContextMenu(commandsList: CommandItem[], windowName: string = `ContextMenu-${Math.random().toString(36).substring(2, 11)}`) {
    const { LEFT, TOP } = Astal.WindowAnchor;
    const [user_commands, setUserCommands] = createState(commandsList);
    const [displayMode, setDisplayMode] = createState<"target" | "description">("target");
    interval(6000, () => { setDisplayMode(current => current === "target" ? "description" : "target") });

    function execCommand(command: CommandItem) {
        execAsync(command.command);
        const w = app.get_window?.(windowName)
        if (w) { w.destroy() }
        app.quit()
    }

    function handleKeyPress(keyval: number, keycode: number, state: Gdk.ModifierType) {
        if (keyval === Gdk.KEY_Escape) {
            const w = app.get_window?.(windowName)
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
        if (state & Gdk.ModifierType.ALT_MASK) modifiers.push("alt");

        const pressedKeybind = [...modifiers, key].join(" + ");

        const command = user_commands.get().find(c => c.keybind?.toLowerCase() === pressedKeybind);
        if (command && command.command) execCommand(command)
    }

    return (
        <window visible
            name={windowName}
            layer={Astal.Layer.TOP}
            exclusivity={Astal.Exclusivity.NORMAL}
            default_width={menuWidth}
            default_height={menuHeight}
            application={app}
            anchor={LEFT | TOP}
            marginLeft={pointerX}
            margin_top={pointerY}
            keymode={Astal.Keymode.ON_DEMAND}
            namespace={"context-menu"}>
            <Gtk.EventControllerKey onKeyPressed={(widget, keyval: number, keycode: number, state: Gdk.ModifierType) =>
                handleKeyPress(keyval, keycode, state)
            } />
            <box cssClasses={["context-menu", "shadow"]} css={`margin: 5px;`} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 7px;`} hexpand homogeneous={false} spacing={7}>
                    <For each={user_commands}>
                        {(command: CommandItem, index) => (
                            <button onClicked={() => { execCommand(command) }}>
                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} spacing={3}>
                                    <box orientation={Gtk.Orientation.HORIZONTAL} homogeneous={false}>
                                        <label cssClasses={["title"]} label={command.name} halign={Gtk.Align.START} hexpand />
                                        {command.keybind && (<label cssClasses={["keybind"]} label={command.keybind} halign={Gtk.Align.START} />)}
                                    </box>
                                    <With value={displayMode}>
                                        {(value) => value === "target" && command.target
                                            ? <CreateEntryContent name={"TARGET"} value={command.target} orientation={Gtk.Orientation.HORIZONTAL} />
                                            : command.description && <CreateEntryContent name={"DESC"} value={command.description} css={`text-transform: uppercase;`} orientation={Gtk.Orientation.HORIZONTAL} />
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

export default function ContextMenu() {
    const { LEFT, TOP } = Astal.WindowAnchor
    const [user_commands, setUserCommands] = createState([
        { name: "Open terminal", target: "CURRENT-WORKSPACE", command: `zsh -ic "spawn-terminal-relative"`, keybind: "enter", description: "Spawns a terminal at the current workspace."},
        { name: "Resize", target: "CURRENT-WINDOW", command: `zsh -ic "resize-current-window"`, keybind: "r", description: "Enter resize submap for the active window."},
        { name: "Move", target: "CURRENT-WINDOW", command: "hyprctl dispatch submap manage-window", description: "Enter move submap for the active window.", keybind: "CTRL + F"},
        { name: "Close", target: "CURRENT-WINDOW", command: "hyprctl kill", keybind: "ctrl + x", description: "Closes the active window."},
        { name: "Toggle floating", target: "CURRENT-WINDOW", command: "hyprctl dispatch togglefloating", keybind: "f", description: "Toggles floating mode for the active window."},
        { name: "Move to the center", target: "CURRENT-WINDOW", command: "hyprctl dispatch centerwindow", keybind: "G", description: "Moves the active window to the center."},
        { name: "Toggle Gaps", target: "GLOBAL-SETTINGS", command: `zsh -ic 'toggle-gaps'`, description: "Toggles gaps between windows."},
        { name: "Increase Gap", target: "GLOBAL-SETTINGS", command: "zsh -ic 'set-innergapsize-ratio +5 && set-outergapsize-ratio +5'", description: "Increases the gap size."},
        { name: "Decrease Gap", target: "GLOBAL-SETTINGS", command: "zsh -ic 'set-innergapsize-ratio -5 && set-outergapsize-ratio -5'", description: "Decreases the gap size."},
    ])
    const [displayMode, setDisplayMode] = createState<"target" | "description">("target");
    interval(6000, () => { setDisplayMode(current => current === "target" ? "description" : "target") });

    function execCommand(command: any) {
        execAsync(command.command);
        const w = app.get_window?.("ContextMenu")
        if (w) { w.destroy() }
        app.quit()
    }
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
            if (command && command.command) execCommand(command)
        }} />
        <box cssClasses={["context-menu", "shadow"]} css={`margin: 5px;`} orientation={Gtk.Orientation.VERTICAL}>
            <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 7px;`} hexpand homogeneous={false} spacing={7}>
                <For each={user_commands} >
                    {(command: any, index) => (
                        <button onClicked={() => {execCommand(command)}}>
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
    css: style,
    main() {
       ContextMenu()
       const poll = interval(200, () => { try { DeleteWindowOnOutofBound(hyprland.cursorPosition, "ContextMenu", pointerX, pointerY, poll); } catch (e) { poll.cancel() } })
    },
})