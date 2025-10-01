import Gtk from "gi://Gtk?version=4.0"
import { CreatePanel, HOME_DIR, playPanelSound } from "../helper";
import { timeout } from "ags/time";
import { execAsync } from "ags/process";
import { createState, With } from "ags";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Gio from "gi://Gio";

export default function LayerInformation() {
    const hyprland = AstalHyprland.get_default();
    const currentMonitorName = hyprland.focused_monitor.name;

    const [bottomLayerJson, setBottomLayerJson] = createState<Array<string>>([]);
    const [topLayerJson, setTopLayerJson] = createState<Array<string>>([]);
    const [overlayLayerJson, setOverlayLayerJson] = createState<Array<string>>([]);
    const [backgroundLayerJson, setBackgroundLayerJson] = createState<Array<string>>([]);
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

                // topLayerJson.get().forEach((item: any, index) => {
                //     console.log(`Top Layer ${index + 1}: ${item?.namespace  }`);
                // });
            } else {
                console.log(`No layer information available for monitor ${currentMonitorName}.`);
            }
        })});

    // console.log(topLayerJson.get());
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={"LAYER INFORMATION"} onClicked={panelClicked} />
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["content"]} spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                            <Gtk.Picture cssClasses={["layer-image"]} file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/layer0.svg`)} canShrink={false} halign={Gtk.Align.FILL} />
                                {/* <box cssClasses={["debug"]} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                                </box> */}
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                                <label cssClasses={["title"]} label={"Background Layer"} halign={Gtk.Align.START} />
                                <label cssClasses={["title"]} label={"Background Layer"} halign={Gtk.Align.START} />
                                <label cssClasses={["title"]} label={"Background Layer"} halign={Gtk.Align.START} />
                            </box>
                        </box>
                        <box cssClasses={["content"]} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                        </box>
                        <box cssClasses={["content"]} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                        </box>
                        <box cssClasses={["content"]} spacing={5} halign={Gtk.Align.FILL} valign={Gtk.Align.START} homogeneous={false} hexpand={false}>
                        </box>
                    </box>
                )}
            </With>
        </box>
    )
}