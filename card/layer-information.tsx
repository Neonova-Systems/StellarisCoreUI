import Gtk from "gi://Gtk?version=4.0"
import { CreatePanel, HOME_DIR, playPanelSound } from "../helper";
import { timeout } from "ags/time";
import { execAsync } from "ags/process";
import { createState, For, With } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Gio from "gi://Gio";
import Adw from "gi://Adw";

interface Layer {
    namespace: string;
    address: string;
    pid: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

export default function LayerInformation() {
    const hyprland = AstalHyprland.get_default();
    const currentMonitorName = hyprland.focused_monitor.name;

    const [backgroundLayerJson, setBackgroundLayerJson] = createState<Array<Layer>>([]);
    const [bottomLayerJson, setBottomLayerJson] = createState<Array<Layer>>([]);
    const [topLayerJson, setTopLayerJson] = createState<Array<Layer>>([]);
    const [overlayLayerJson, setOverlayLayerJson] = createState<Array<Layer>>([]);
    const [toggleContentState, settoggleContentState] = createState(false);
    timeout(500, () => { execAsync('ags request "getLayerInformationState"').then((out) => { settoggleContentState(out === 'true'); }) });
    function panelClicked() {
        execAsync('ags request "toggleLayerInformation"').then(out => {
            const isVisible = out === 'true';
            settoggleContentState(isVisible);
            if (isVisible) {
                playPanelSound(500);
            }
        });
    }
    timeout(500, () => { execAsync('hyprctl layers -j').then((out) => {
            const layerData = JSON.parse(out);
            const currentMonitorLayers = layerData[currentMonitorName] || [];

            if (currentMonitorLayers) {
                setBackgroundLayerJson(currentMonitorLayers.levels["0"] || []);
                setBottomLayerJson(currentMonitorLayers.levels["1"] || []);
                setTopLayerJson(currentMonitorLayers.levels["2"] || []);
                setOverlayLayerJson(currentMonitorLayers.levels["3"] || []);
            } else {
                console.log(`No layer information available for monitor ${currentMonitorName}.`);
            }
        })});

    // console.log(topLayerJson.get());
    timeout(800, () => {
        console.log(backgroundLayerJson.get()); 
        for (const item of backgroundLayerJson.get()) {
            console.log(item.namespace);
        }
    });
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={"LAYER INFORMATION"} onClicked={panelClicked} />
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <Adw.Clamp maximumSize={hyprland.focused_monitor.height / 4.5} >
                                <Gtk.Picture cssClasses={["layer-image"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/layer0.svg`)} canShrink={false} contentFit={Gtk.ContentFit.FILL} />
                            </Adw.Clamp>
                            <With value={backgroundLayerJson}>
                                {(_) => (
                                    <box orientation={Gtk.Orientation.VERTICAL} spacing={5} homogeneous={false} hexpand={false} valign={Gtk.Align.START} halign={Gtk.Align.FILL}>
                                        <For each={backgroundLayerJson}>
                                            {(item) => (
                                                <box orientation={Gtk.Orientation.VERTICAL} spacing={1}>
                                                    <label cssClasses={["layer-namespace"]} label={`${item.namespace.toUpperCase()}`} halign={Gtk.Align.START} />
                                                    <label cssClasses={["entry"]} label={`${item.address.toUpperCase()} ${item.w}X${item.h} ${item.x}X${item.y}`} halign={Gtk.Align.START} />
                                                </box>
                                            )}
                                        </For>
                                    </box>
                                )}
                            </With>
                        </box>
                        <box cssClasses={["content"]} spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <Adw.Clamp maximumSize={hyprland.focused_monitor.height / 4.5} >
                                <Gtk.Picture cssClasses={["layer-image"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/layer1.svg`)} canShrink={false} contentFit={Gtk.ContentFit.FILL} />
                            </Adw.Clamp>
                            <With value={bottomLayerJson}>
                                {(v) => (
                                    <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                                        <For each={bottomLayerJson}>
                                            {(item) => (
                                                <box orientation={Gtk.Orientation.VERTICAL} spacing={1}>
                                                    <label cssClasses={["layer-namespace"]} label={`${item.namespace.toUpperCase()}`} halign={Gtk.Align.START} />
                                                    <label cssClasses={["entry"]} label={`${item.address.toUpperCase()} ${item.w}X${item.h} ${item.x}X${item.y}`} halign={Gtk.Align.START} />
                                                </box>
                                            )}
                                        </For>
                                    </box>
                                )}
                            </With>
                        </box>
                        <box cssClasses={["content"]} spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <Adw.Clamp maximumSize={hyprland.focused_monitor.height / 4.5} >
                                <Gtk.Picture cssClasses={["layer-image"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/layer2.svg`)} canShrink={false} contentFit={Gtk.ContentFit.FILL} />
                            </Adw.Clamp>
                            <With value={topLayerJson}>
                                {(v) => (
                                    <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                                        <For each={topLayerJson}>
                                            {(item) => (
                                                <box orientation={Gtk.Orientation.VERTICAL} spacing={1}>
                                                    <label cssClasses={["layer-namespace"]} label={`${item.namespace.toUpperCase()}`} halign={Gtk.Align.START} />
                                                    <label cssClasses={["entry"]} label={`${item.address.toUpperCase()} ${item.w}X${item.h} ${item.x}X${item.y}`} halign={Gtk.Align.START} />
                                                </box>
                                            )}
                                        </For>
                                    </box>
                                )}
                            </With>
                        </box>
                        <box cssClasses={["content"]} spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <Adw.Clamp maximumSize={hyprland.focused_monitor.height / 4.5} >
                                <Gtk.Picture cssClasses={["layer-image"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/layer3.svg`)} canShrink={false} contentFit={Gtk.ContentFit.FILL} />
                            </Adw.Clamp>
                            <With value={overlayLayerJson}>
                                {(v) => (
                                    <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                                        <For each={overlayLayerJson}>
                                            {(item) => (
                                                <box orientation={Gtk.Orientation.VERTICAL} spacing={1}>
                                                    <label cssClasses={["layer-namespace"]} label={`${item.namespace.toUpperCase()}`} halign={Gtk.Align.START} />
                                                    <label cssClasses={["entry"]} label={`${item.address.toUpperCase()} ${item.w}X${item.h} ${item.x}X${item.y}`} halign={Gtk.Align.START} />
                                                </box>
                                            )}
                                        </For>
                                    </box>
                                )}
                            </With>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}