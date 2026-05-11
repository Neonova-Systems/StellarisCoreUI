import { Gtk } from "ags/gtk4"
import { CreatePanel, Align, ICON_DIR, HOME_DIR, initToggleState, panelClicked } from "../helper"
import { createState, With } from "ags"
import { readJson } from "../helper/json"
import { execAsync } from "ags/process"
import GLib from "gi://GLib?version=2.0"
import CreateCard from "../helper/create-card"

type RecentEntry = {
    class: string;
    title?: string;
    icon?: string;
    desktopEntry?: string;
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
                <box cssClasses={["content"]} halign={Align.FILL} valign={Align.LEFT} homogeneous={false} hexpand={false}>
                    <scrolledwindow minContentWidth={100} minContentHeight={133} hexpand={true}>
                        <With value={recent}>
                            {(list) => (
                                <box orientation={Gtk.Orientation.VERTICAL} spacing={8} hexpand>
                                    {list.map((item) => (
                                        <button onClicked={() => launchEntry(item)} cssClasses={["recent-app-item"]}>
                                            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4} halign={Align.LEFT} valign={Align.CENTER}>
                                                {item.icon ? <Gtk.Image iconName={item.icon} pixelSize={36} /> : <image file={`${ICON_DIR}/majesticons--app-window.svg`} pixelSize={36} />}
                                                <label cssClasses={["app-name"]} label={item.title ?? item.class} />
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
            <CreatePanel isActive={toggleContentState} name="RECENT APPS" onClicked={() => panelClicked("RecentlyUsed", setToggleContentState)}
                draggable
                onDragUp={onDragUp}
                onDragDown={onDragDown}>
            </CreatePanel>
        </CreateCard>
    )
}
