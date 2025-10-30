import { createState, For, With } from "ags";
import { CreateEntryContent, CreatePanel, createRandomString, playPanelSound } from "../helper";
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

    const controlEntry = [
        { index: 1, name: "Open Powermenu", target: "", command: ``, description: "Show options to shutdown, restart, or log out."},
        { index: 1, name: "Scan Text", target: "", command: ``, description: "Scan and copy text from an area of the screen (OCR)."},
        { name: "Scan QR", target: "", command: ``, description: "Scan a QR code from the screen or webcam."},
        { name: "Switch Window", target: "ALL-WORKSPACE", command: ``, description: "List and switch between all open windows."},
        { name: "Change Wallpaper", target: "", command: ``, description: "Open the wallpaper selector to change your background."},
        { name: "Kill Application", target: "", command: ``, description: "Force-quit an unresponsive application by clicking on it."},
        { name: "Screen Record", target: "", command: ``, description: "Start recording a video of your screen."},
        { name: "Color Picker", target: "", command: ``, description: "Select a color from anywhere on your screen."},
        { name: "Cursor Zoom", target: "", command: ``, description: "Magnify the area around the cursor for visibility."},
        { name: "Cursor Zoom", target: "", command: ``, description: "Magnify the area around the cursor for visibility."},
    ].map((entry, idx) => ({ ...entry, index: idx + 1 }));
    const [tempArray, setTempArray] = createState<any[][]>([]);

    // Helper function to chunk array into groups of 4
    const chunkArray = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };


    // Initialize tempArray with chunked controlEntry
    setTempArray(chunkArray(controlEntry, 5));

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={"CONTROL CENTER"} onClicked={panelClicked} draggable onDragUp={onDragUp} onDragDown={onDragDown}/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 7px;`} hexpand>
                            <For each={tempArray}>
                                {(chunk: any[]) => (
                                    <box cssClasses={['control-collection']} homogeneous={true} spacing={5}>
                                        {chunk.map((entry: any) => {
                                            const randomNumber = Math.random() > 0.5;
                                            return (
                                                <button onClicked={() => entry.command && execAsync(entry.command)}>
                                                    <box cssClasses={[(randomNumber ? "entry" : "alt-entry")]} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} spacing={5}>
                                                        <box orientation={Gtk.Orientation.HORIZONTAL} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} vexpand>
                                                            <label label={entry.index.toString() + "."} halign={Gtk.Align.START} />
                                                            <box hexpand/>
                                                            <label label={"0x" + createRandomString(4).toUpperCase()} halign={Gtk.Align.END} />
                                                        </box>
                                                        <label cssClasses={["title-content"]} label={entry.name} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} vexpand wrap/>
                                                        <label label={createRandomString(15)} cssClasses={["uppercase"]} css={`font-size: 7px;`} halign={Gtk.Align.FILL} valign={Gtk.Align.END} vexpand wrap/>
                                                    </box>
                                                </button>
                                            );
                                        })}
                                    </box>
                                )}
                            </For>
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}