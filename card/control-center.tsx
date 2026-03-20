import { createState, For, With } from "ags";
import { CreateEntryContent, CreatePanel, createRandomString, HOME_DIR, panelClicked, playSound, AudioFile, Align } from "../helper";
import { Gtk } from "ags/gtk4"
import { interval, timeout } from "ags/time";
import { execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import AudioControl from "./control-center/audio-control";

export default function ControlCenter({ onDragUp, onDragDown }: { onDragUp?: () => void, onDragDown?: () => void }) {
    const [toggleContentState, settoggleContentState] = createState(false);
    const [decorationImage, setDecorationImage] = createState(`${HOME_DIR}/.config/ags/assets/dots/Variant=Variant1.svg`);
    timeout(500, () => { execAsync('ags request "getControlCenterState"').then(out => settoggleContentState(out === 'true')) });
    const spacingControlEntry = 3;

    function cycleDecorationImage() { setDecorationImage(`${HOME_DIR}/.config/ags/assets/dots/Variant=Variant${Math.floor(Math.random() * 15) + 1}.svg`) }
    interval(1396, () => cycleDecorationImage())
    const controlEntry = [
        { name: "Open Powermenu", target: "", command: `ags run ${HOME_DIR}/.config/ags/window/context-menu/power-menu.tsx --gtk 4`, description: "Show options to shutdown, restart, or log out."},
        { name: "Scan Text", target: "", command: ``, description: "Scan and copy text from an area of the screen (OCR)."},
        { name: "Scan QR", target: "", command: ``, description: "Scan a QR code from the screen or webcam."},
        { name: "Switch Window", target: "ALL-WORKSPACE", command: ``, description: "List and switch between all open windows."},
        { name: "Change Wallpaper", target: "", command: ``, description: "Open the wallpaper selector to change your background."},
        { name: "None", target: "", command: ``, description: ""},
        { name: "Kill Application", target: "", command: `hyprctl kill`, description: "Force-quit an unresponsive application by clicking on it."},
        { name: "Screen Record", target: "", command: ``, description: "Start recording a video of your screen."},
        { name: "Color Picker", target: "", command: `zsh -ic 'autoload colorpicker && colorpicker | wl-copy'`, description: "Select a color from anywhere on your screen."},
        { name: "Cursor Zoom", target: "", command: ``, description: "Magnify the area around the cursor for visibility."},
        { name: "None", target: "", command: ``, description: ""},
        { name: "None", target: "", command: ``, description: ""},
    ].map((entry, idx) => ({ ...entry, index: idx + 1 }));
    const [tempArray, setTempArray] = createState<any[][]>([]);

    const render = (type: string, alt: boolean) => {
        return (
            <Gtk.Picture
                cssClasses={[(alt ? "alt-overlay" : "overlay")]}
                file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/${alt ? "alt-" : ""}${type}-block.svg`)}
                canShrink={true}
                contentFit={Gtk.ContentFit.FILL}
                halign={Align.FILL}
                valign={Align.FILL}
                hexpand vexpand />
        )
    }

    function EntryClicked(command : string)  {
        command && execAsync(command).catch((e) => print(e));
        playSound(AudioFile.Enter)
    }

    // Helper function to chunk array into groups of *number*
    const chunkArray = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    setTempArray(chunkArray(controlEntry, 6));

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={"CONTROL CENTER"} onClicked={() => panelClicked("ControlCenter", settoggleContentState)} draggable onDragUp={onDragUp} onDragDown={onDragDown}/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 10px;`} hexpand>
                            <box marginBottom={5}>
                                <With value={decorationImage}> 
                                    {(path) => ( <Gtk.Picture file={Gio.File.new_for_path(path)} canShrink={false} contentFit={Gtk.ContentFit.FILL} halign={Align.FILL} hexpand/> )} 
                                </With>
                            </box>
                            <For each={tempArray}>
                                {(chunk: any[], chunkIndex) => {
                                    const currentIndex = chunkIndex.peek();
                                    const totalChunks = tempArray.peek().length;
                                    const isFirstChunk = currentIndex === 0;
                                    const isLastChunk = currentIndex === totalChunks - 1;
                                    return (
                                        <box cssClasses={['control-collection']} css={`min-height: 70px;`} homogeneous={true} spacing={spacingControlEntry}>
                                            {chunk.map((entry: any) => {
                                                const randomNumber = Math.random() > 0.5;
                                                const showFirstOverlay = randomNumber && isFirstChunk;
                                                const showLastOverlay = randomNumber && isLastChunk;
                                                const showAltFirstOverlay = !randomNumber && isFirstChunk;
                                                const showAltLastOverlay = !randomNumber && isLastChunk;
                                                const entryDecoration =
                                                    (showAltFirstOverlay && render('first', true)) ||
                                                    (showAltLastOverlay && render('last', true)) ||
                                                    (showFirstOverlay && render('first', false)) ||
                                                    (showLastOverlay && render('last', false));
                                                return (
                                                    <button onClicked={() => EntryClicked(entry.command)}>
                                                        <overlay cssClasses={["container", "border"]}>
                                                            <Gtk.EventControllerMotion onEnter={() => playSound(AudioFile.Key)} />
                                                            {entryDecoration || <box hexpand vexpand />}
                                                            <box $type="overlay" cssClasses={[(randomNumber ? "entry" : "alt-entry"), (isFirstChunk ? "first-chunk" : "last-chunk")]} orientation={Gtk.Orientation.VERTICAL} halign={Align.FILL} hexpand vexpand>
                                                                <box orientation={Gtk.Orientation.HORIZONTAL} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} vexpand>
                                                                    <label label={entry.index.toString() + "."} halign={Align.LEFT} />
                                                                    <box hexpand />
                                                                    <label label={"0x" + createRandomString(3).toUpperCase()} halign={Align.RIGHT} />
                                                                </box>
                                                                <label cssClasses={["title-content"]} label={entry.name} halign={Align.CENTER} valign={Align.CENTER} vexpand wrap />
                                                                <label label={createRandomString(13)} cssClasses={["uppercase"]} halign={Align.FILL} valign={Align.RIGHT} vexpand wrap />
                                                            </box>
                                                        </overlay>
                                                    </button>
                                                );
                                            })}
                                        </box>
                                    );
                                }}
                            </For>
                            <AudioControl />
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}