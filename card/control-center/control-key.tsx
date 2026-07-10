import { createState, For, With } from "ags";
import { Gtk } from "ags/gtk4";
import { interval } from "ags/time";
import { execAsync } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import { Align, AudioFile, createRandomString, HOME_DIR, playSound } from "../../helper";
import { watchRequestBoolean } from "../../helper/behaviour";
import CreateValueWatcher from "../../helper/create-value-watcher";

type ControlEntry = {
  name: string;
  target: string;
  command: string;
  description: string;
  index: number;
};

export default function ControlKey() {
  const [toggleControlEntryState, setToggleControlEntryState] = createState(true);
  const [decorationImage, setDecorationImage] = createState(`${HOME_DIR}/.config/ags/assets/dots/Variant=Variant1.svg`);
  const spacingControlEntry = 3;

  watchRequestBoolean("ControlKey", 100, (value) => setToggleControlEntryState(value));

  function cycleDecorationImage() {
    setDecorationImage(`${HOME_DIR}/.config/ags/assets/dots/Variant=Variant${Math.floor(Math.random() * 15) + 1}.svg`);
  }

  interval(1396, () => cycleDecorationImage());

  const controlEntry: ControlEntry[] = [
    { name: "Open Powermenu", target: "", command: `ags run ${HOME_DIR}/.config/ags/window/context-menu/power-menu.tsx --gtk 4`, description: "Show options to shutdown, restart, or log out.", index: 1 },
    { name: "Scan Text", target: "", command: "", description: "Scan and copy text from an area of the screen (OCR).", index: 2 },
    { name: "Scan QR", target: "", command: "", description: "Scan a QR code from the screen or webcam.", index: 3 },
    { name: "Switch Window", target: "ALL-WORKSPACE", command: "", description: "List and switch between all open windows.", index: 4 },
    { name: "Change Wallpaper", target: "", command: "", description: "Open the wallpaper selector to change your background.", index: 5 },
    { name: "None", target: "", command: "", description: "", index: 6 },
    { name: "Kill Application", target: "", command: "hyprctl kill", description: "Force-quit an unresponsive application by clicking on it.", index: 7 },
    { name: "Screen Record", target: "", command: "", description: "Start recording a video of your screen.", index: 8 },
    { name: "Color Picker", target: "", command: "zsh -ic 'autoload colorpicker && colorpicker | wl-copy'", description: "Select a color from anywhere on your screen.", index: 9 },
    { name: "Cursor Zoom", target: "", command: "", description: "Magnify the area around the cursor for visibility.", index: 10 },
    { name: "None", target: "", command: "", description: "", index: 11 },
    { name: "None", target: "", command: "", description: "", index: 12 },
  ];

  const [tempArray, setTempArray] = createState<ControlEntry[][]>([]);

  function render(type: string, alt: boolean) {
    return (
      <Gtk.Picture
        cssClasses={[(alt ? "alt-overlay" : "overlay")]}
        file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/${alt ? "alt-" : ""}${type}-block.svg`)}
        canShrink={true}
        contentFit={Gtk.ContentFit.FILL}
        halign={Align.FILL}
        valign={Align.FILL}
        hexpand
        vexpand
      />
    );
  }

  function entryClicked(command: string) {
    command && execAsync(command).catch((e) => print(e));
    playSound(AudioFile.Enter);
  }

  const chunkArray = (arr: ControlEntry[], size: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  setTempArray(chunkArray(controlEntry, 6));

  return (
    <CreateValueWatcher value={toggleControlEntryState}>
      {(v) => (
        <box visible={v} orientation={Gtk.Orientation.VERTICAL} marginBottom={10}>
          <box marginBottom={5}>
            <With value={decorationImage}>
              {(path) => <Gtk.Picture file={Gio.File.new_for_path(path)} canShrink={false} contentFit={Gtk.ContentFit.FILL} halign={Align.FILL} hexpand />}
            </With>
          </box>
          <For each={tempArray}>
            {(chunk: ControlEntry[], chunkIndex) => {
              const currentIndex = chunkIndex.peek();
              const totalChunks = tempArray.peek().length;
              const isFirstChunk = currentIndex === 0;
              const isLastChunk = currentIndex === totalChunks - 1;

              return (
                <box cssClasses={["control-collection"]} css={`min-height: 70px;`} homogeneous={true} spacing={spacingControlEntry}>
                  {chunk.map((entry) => {
                    const randomNumber = Math.random() > 0.5;
                    const showFirstOverlay = randomNumber && isFirstChunk;
                    const showLastOverlay = randomNumber && isLastChunk;
                    const showAltFirstOverlay = !randomNumber && isFirstChunk;
                    const showAltLastOverlay = !randomNumber && isLastChunk;
                    const entryDecoration =
                      (showAltFirstOverlay && render("first", true)) ||
                      (showAltLastOverlay && render("last", true)) ||
                      (showFirstOverlay && render("first", false)) ||
                      (showLastOverlay && render("last", false));

                    return (
                      <button onClicked={() => entryClicked(entry.command)}>
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
        </box>
      )}
    </CreateValueWatcher>
  );
}
