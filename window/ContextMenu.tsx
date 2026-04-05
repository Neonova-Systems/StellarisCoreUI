import { Astal, Gdk, Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"
import style from "./context-menu/style.scss";
import AstalHyprland from "gi://AstalHyprland?version=0.1"

import { Align, CreateEntryContent } from "../helper";
import { exec, execAsync } from "ags/process";
import { interval } from "ags/time";

const hyprland = AstalHyprland.get_default();
const menuWidth = 300;

interface CommandItem {
    name: string;
    description?: string;
    command: string;
    keybind?: string;
    dontAsync?: boolean;
}

export function spawnContextMenu(commandList: CommandItem[]) {
    const id = `context-menu-${Math.random().toString(36).substring(2, 11)}`; // unique id
    const { x: spawnX, y: spawnY } = hyprland.cursorPosition;
    
    app.start({
        instanceName: id,
        css: style,
        main() {
            SpawnContextMenu(commandList, id, spawnX, spawnY);
        },
    })
}

function execCommand(command: CommandItem, windowName: string = "context-menu") {
    (command.dontAsync) ? exec(command.command) : execAsync(command.command);
    const w = app.get_window?.(windowName)
    if (w) { w.destroy() }
    app.quit()
}

function SpawnContextMenu(commandsList: CommandItem[], windowName: string, cursorPosX: number, cursorPosY: number) {
    const { LEFT, RIGHT, TOP, BOTTOM } = Astal.WindowAnchor;

    const monitor = hyprland.get_monitors().find((m) =>
        cursorPosX >= m.x &&
        cursorPosX < m.x + m.width &&
        cursorPosY >= m.y &&
        cursorPosY < m.y + m.height,
    ) ?? hyprland.get_focused_monitor();

    const monitorX = monitor?.x ?? 0;
    const monitorY = monitor?.y ?? 0;
    const monitorWidth = monitor?.width ?? 0;
    const monitorHeight = monitor?.height ?? 0;

    const verticalFlipThreshold = 220;
    const useRightAnchor = cursorPosX >= monitorX + monitorWidth - menuWidth;
    const useBottomAnchor = cursorPosY >= monitorY + monitorHeight - verticalFlipThreshold;

    const horizontalAnchor = useRightAnchor ? RIGHT : LEFT;
    const verticalAnchor = useBottomAnchor ? BOTTOM : TOP;

    const marginTop = Math.max(0, cursorPosY - monitorY);
    const marginBottom = Math.max(0, monitorY + monitorHeight - cursorPosY);
    const marginLeft = Math.max(0, cursorPosX - monitorX);
    const marginRight = Math.max(0, monitorX + monitorWidth - cursorPosX);

    const outOfBoundOffset = 15;
    let poll: ReturnType<typeof interval> | null = null;

    function closeContextMenu() {
        const w = app.get_window?.(windowName)
        if (w) { w.destroy() }
        poll?.cancel();
        poll = null;
        app.quit()
    }

    poll = interval(30, () => {
        const currentCursorPos = hyprland.cursorPosition;
        if (!currentCursorPos) return;

        const windowWidth = app.get_window?.(windowName)?.get_width() || menuWidth;
        const windowHeight = app.get_window?.(windowName)?.get_height() || 0;

        const windowStartX = useRightAnchor ? cursorPosX - windowWidth : cursorPosX;
        const windowStartY = useBottomAnchor ? cursorPosY - windowHeight : cursorPosY;

        if (
            currentCursorPos.x < windowStartX - outOfBoundOffset ||
            currentCursorPos.x > windowStartX + windowWidth + outOfBoundOffset ||
            currentCursorPos.y < windowStartY - outOfBoundOffset ||
            currentCursorPos.y > windowStartY + windowHeight + outOfBoundOffset
        ) {
            closeContextMenu();
        }
    });

    function handleKeyPress(keyval: number, keycode: number, state: Gdk.ModifierType) {
        if (keyval === Gdk.KEY_Escape) {
            closeContextMenu();
            return;
        }

        let key;
        if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
            key = "enter";
        } else if (keyval === Gdk.KEY_space) {
            key = "space";
        } else {
            key = String.fromCharCode(Gdk.keyval_to_lower(keyval));
        }
        if (!key) return;

        const modifiers = [];
        if (state & Gdk.ModifierType.CONTROL_MASK) modifiers.push("ctrl");
        if (state & Gdk.ModifierType.SHIFT_MASK) modifiers.push("shift");
        if (state & Gdk.ModifierType.ALT_MASK) modifiers.push("alt");

        const pressedKeybind = [...modifiers, key].join(" + ");

        const command = commandsList.find(c => c.keybind?.toLowerCase() === pressedKeybind);
        if (command && command.command) execCommand(command, windowName)
    }

    return (
        <window visible
            name={windowName}
            layer={Astal.Layer.TOP}
            exclusivity={Astal.Exclusivity.IGNORE}
            default_width={menuWidth}
            application={app}
            anchor={horizontalAnchor | verticalAnchor}
            marginLeft={!useRightAnchor ? marginLeft : undefined}
            marginRight={useRightAnchor ? marginRight : undefined}
            marginTop={!useBottomAnchor ? marginTop : undefined}
            marginBottom={useBottomAnchor ? marginBottom : undefined}
            keymode={Astal.Keymode.ON_DEMAND}
            namespace={"context-menu"}>
            <Gtk.EventControllerKey onKeyPressed={(widget, keyval: number, keycode: number, state: Gdk.ModifierType) =>
                handleKeyPress(keyval, keycode, state)
            } />
            <box cssClasses={["context-menu", "shadow"]} css={`margin: 5px;`} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 7px;`} hexpand homogeneous={false} spacing={7}>
                    {commandsList.map((command: CommandItem) => (
                        <button onClicked={() => { execCommand(command, windowName) }}>
                            <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} halign={Align.FILL} spacing={3}>
                                <box orientation={Gtk.Orientation.HORIZONTAL} homogeneous={false}>
                                    <label cssClasses={["title"]} label={command.name} halign={Align.LEFT} hexpand />
                                    {command.keybind && (<label cssClasses={["keybind"]} label={command.keybind} halign={Align.LEFT} />)}
                                </box>
                                <CreateEntryContent name={"DESC"} value={command.description} css={`text-transform: uppercase;`} orientation={Gtk.Orientation.HORIZONTAL} />
                            </box>
                        </button>
                    ))}
                </box>
            </box>
        </window>
    )
}