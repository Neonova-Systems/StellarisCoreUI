import { Gtk } from "ags/gtk4"
import { CreatePanel, Align, HOME_DIR, initToggleState, panelClicked, CreateEntryContent } from "../helper"
import { createState, For, With } from "ags"
import { readJson } from "../helper/json"
import { execAsync } from "ags/process"
import GLib from "gi://GLib?version=2.0"
import CreateCard from "../helper/create-card"
import { Corner, drawChamferedBackground } from "../helper/draw-function"
import Pango from "gi://Pango?version=1.0"

type RecentEntry = {
    class: string;
    title?: string;
    desktopEntry?: string;
    pid?: number;
    launchCount?: number;
    lastAccess?: string;
    execPath?: string;
    score?: number;
}

const RECENT_APPS_JSON = "recent_apps.json";
const MAX_ITEMS = 10;

export default function RecentlyUsed({ onDragUp, onDragDown }: { onDragUp?: () => void, onDragDown?: () => void }) {
    const [recent, setRecent] = createState<RecentEntry[]>(readJson<RecentEntry[]>(RECENT_APPS_JSON, []));
    const [toggleContentState, setToggleContentState] = createState(false);
    initToggleState("RecentlyUsed", setToggleContentState);

    // Poll file for external updates (listener/script writes to cache)
    const reload = () => {
        const data = readJson<RecentEntry[]>(RECENT_APPS_JSON, []);
        setRecent(data.slice(0, MAX_ITEMS));
    }

    // update on interval
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10000, () => {
        reload();
        return GLib.SOURCE_CONTINUE;
    });

    function launchEntry(entry: RecentEntry) {
        const launchId = entry.desktopEntry ?? entry.class;
        execAsync(`sh -lc 'gtk-launch ${launchId} 2>/dev/null || ${entry.class} 2>/dev/null'`).catch(e => console.error(e));
    }

    function renderContent() {
        return (
            <box cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                <box cssClasses={["content"]} orientation={Gtk.Orientation.VERTICAL} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                    <scrolledwindow minContentWidth={100} minContentHeight={294} hexpand={true}>
                        <With value={recent}>
                            {(list) => (
                                <box orientation={Gtk.Orientation.VERTICAL} spacing={10} hexpand>
                                    {list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((item) => (
                                        <button onClicked={() => launchEntry(item)} cssClasses={["recent-app-item"]}>
                                            <box>
                                                <overlay>
                                                    <box css={`min-height: 93px;`}>
                                                        <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({ area, cr, width, height, notchSize: 13, backgroundColor: "#000000", backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{ corner: Corner.BottomRight }], }))} />
                                                    </box>
                                                    <box cssClasses={["content"]} $type="overlay" orientation={Gtk.Orientation.VERTICAL} spacing={5}>
                                                        <box spacing={5} valign={Align.TOP} halign={Align.FILL} hexpand>
                                                            <label cssClasses={["title", "uppercase"]} justify={Gtk.Justification.LEFT} halign={Align.FILL} hexpand xalign={0} label={item.title ?? item.class} singleLineMode ellipsize={Pango.EllipsizeMode.MIDDLE} />
                                                        </box>
                                                        <box cssClasses={["entry"]} halign={Align.FILL} marginTop={3} spacing={5} hexpand>
                                                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand>
                                                                <CreateEntryContent name={"LAUNCH COUNT"} animation={false} value={item.launchCount?.toString() ?? "1"} watchValue hexpand/>
                                                                <CreateEntryContent name={"SCORE"} animation={false} value={(item.score ?? 0).toFixed(2)} watchValue vexpand/>
                                                            </box>
                                                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand>
                                                                <CreateEntryContent name={"WINDOW CLASS"} animation={false} value={item.class} watchValue />
                                                            </box>
                                                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand>
                                                                <CreateEntryContent name={"EXEC PATH"} animation={false} value={item.execPath ?? item.desktopEntry ?? item.class} watchValue vexpand/>
                                                            </box>
                                                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand>
                                                                <CreateEntryContent name={"PID"} animation={false} value={item.pid?.toString() ?? "UNKNOWN"} watchValue />
                                                            </box>
                                                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand>
                                                            </box>
                                                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} >
                                                                <CreateEntryContent name={"LAST ACCESS"} animation={false} value={item.lastAccess ?? "UNKNOWN"} watchValue vexpand/>
                                                            </box>
                                                        </box>
                                                    </box>
                                                </overlay>
                                            </box>
                                        </button>
                                    ))}
                                </box>
                            )}
                        </With>
                    </scrolledwindow>
                </box>
            </box>
        )
    }
    return (
        <CreateCard state={toggleContentState} cardContent={() => renderContent()}>
            <CreatePanel isActive={toggleContentState} name="RECENT APPS" 
                onClicked={() => panelClicked("RecentlyUsed", setToggleContentState)}
                draggable
                onDragUp={onDragUp}
                onDragDown={onDragDown}>
            </CreatePanel>
        </CreateCard>
    )
}
