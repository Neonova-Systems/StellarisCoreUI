import Gtk from "gi://Gtk?version=4.0"
import { CreatePanel, HOME_DIR, playPanelSound } from "../helper";
import { timeout } from "ags/time";
import { execAsync } from "ags/process";
import { Accessor, createState, For, With } from "ags";
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

function LayerContentFragment({ layers, layerNumber, layerTitle, maximumSize }: { layers: Accessor<Array<Layer>>, layerNumber: string, layerTitle: string, maximumSize: number }) {
    return (
        <box spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
            <Adw.Clamp maximumSize={maximumSize}>
                <box css="min-width: 245px;" halign={Gtk.Align.FILL} homogeneous={false} hexpand={false}>
                    <overlay>
                        <Gtk.Picture 
                            $type="overlay" 
                            cssClasses={["layer-image"]} 
                            file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/layer${layerNumber}.svg`)} 
                            canShrink={false} 
                            contentFit={Gtk.ContentFit.FILL} 
                        />
                    </overlay>
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={3} halign={Gtk.Align.FILL} valign={Gtk.Align.CENTER} css={'padding-top: 12px; padding-bottom: 11px;'} hexpand>
                        <label cssClasses={["layer-title"]} label={layerTitle} />
                        <label cssClasses={["layer-number"]} label={`LAYER ${layerNumber.padStart(2, '0')}`} />
                        <label cssClasses={["layer-title"]} label={layerTitle} />
                    </box>
                </box>
            </Adw.Clamp>
            <With value={layers}>
                {(_) => (
                    <box orientation={Gtk.Orientation.VERTICAL} spacing={5} homogeneous={false} hexpand={true} valign={Gtk.Align.CENTER} halign={Gtk.Align.FILL}>
                        <For each={layers}>
                            {(item) => (
                                <box orientation={Gtk.Orientation.VERTICAL} spacing={1}>
                                    <label cssClasses={["layer-namespace"]} label={`${item.namespace.toUpperCase()}`} halign={Gtk.Align.START} />
                                    <label cssClasses={["entry"]} css={'font-size: 7px;'} label={`${item.address.toUpperCase()} ${item.w}X${item.h} ${item.x}X${item.y}`} halign={Gtk.Align.START} />
                                </box>
                            )}
                        </For>
                    </box>
                )}
            </With>
        </box>
    );
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
        })
    });

    const masximumSize = hyprland.focused_monitor.height / 4.5;
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false} hexpand={false}>
            <CreatePanel name={"LAYER INFORMATION"} onClicked={panelClicked} />
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} css={`padding: 14px;`} spacing={15} orientation={Gtk.Orientation.VERTICAL}>
                        <LayerContentFragment 
                            layers={backgroundLayerJson}
                            layerNumber="0"
                            layerTitle="BACKGROUND"
                            maximumSize={masximumSize}
                        />
                        <LayerContentFragment 
                            layers={bottomLayerJson}
                            layerNumber="1"
                            layerTitle="BOTTOM"
                            maximumSize={masximumSize}
                        />
                        <LayerContentFragment 
                            layers={topLayerJson}
                            layerNumber="2"
                            layerTitle="TOP"
                            maximumSize={masximumSize}
                        />
                        <LayerContentFragment
                            layers={overlayLayerJson}
                            layerNumber="3"
                            layerTitle="OVERLAY"
                            maximumSize={masximumSize}
                        />
                    </box>
                )}
            </With>
        </box>
    )
}