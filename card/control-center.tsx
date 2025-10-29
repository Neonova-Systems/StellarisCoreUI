import { createState, For, With } from "ags";
import { CreateEntryContent, CreatePanel, playPanelSound } from "../helper";
import { Gtk } from "ags/gtk4"
import { timeout } from "ags/time";
import { execAsync } from "ags/process";

export default function ControlCenter({ onDragUp, onDragDown }: { onDragUp?: () => void, onDragDown?: () => void }) {
    const [toggleContentState, settoggleContentState] = createState(false);
    timeout(500, () => { execAsync('ags request "getControlCenterState"').then(out => settoggleContentState(out === 'true')) });
    function panelClicked() {
        execAsync('ags request "toggleControlCenter"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        }).catch(() => {});
    }

    const [controlEntry, setControlEntry] = createState([
        { name: "Open Powermenu", target: "", command: ``, description: "Show options to shutdown, restart, or log out."},
        { name: "Scan Text", target: "", command: ``, description: "Scan and copy text from an area of the screen (OCR)."},
        { name: "Scan QR", target: "", command: ``, description: "Scan a QR code from the screen or webcam."},
        { name: "Switch Window", target: "ALL-WORKSPACE", command: ``, description: "List and switch between all open windows."},
        { name: "Change Wallpaper", target: "", command: ``, description: "Open the wallpaper selector to change your background."},
        { name: "Kill Application", target: "", command: ``, description: "Force-quit an unresponsive application by clicking on it."},
        { name: "Screen Record", target: "", command: ``, description: "Start recording a video of your screen."},
        { name: "Color Picker", target: "", command: ``, description: "Select a color from anywhere on your screen."},
        { name: "Cursor Zoom", target: "", command: ``, description: "Magnify the area around the cursor for visibility."},
    ])
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={"CONTROL CENTER"} onClicked={panelClicked} draggable onDragUp={onDragUp} onDragDown={onDragDown}/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} halign={Gtk.Align.FILL} orientation={Gtk.Orientation.VERTICAL} homogeneous={false} hexpand={false}>
                            <For each={controlEntry} >
                                {(command: any, index) => (
                                    <button onClicked={() => {}}>
                                        <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} spacing={3}>
                                            <box orientation={Gtk.Orientation.HORIZONTAL} homogeneous={false}>
                                                <label cssClasses={["title"]} label={command.name} halign={Gtk.Align.START} hexpand />
                                            </box>
                                            <CreateEntryContent name={"DESC"} value={command.description} css={`text-transform: uppercase;`} orientation={Gtk.Orientation.HORIZONTAL} />
                                        </box>
                                    </button>
                                )}
                            </For>
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}