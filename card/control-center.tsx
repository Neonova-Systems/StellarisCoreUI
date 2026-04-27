import { createState, With } from "ags";
import { CreatePanel, panelClicked, TOOLTIP_TEXT_CONTEXT_MENU } from "../helper";
import { Gtk } from "ags/gtk4"
import AudioControl from "./control-center/audio-control";
import ControlKey from "./control-center/control-key";
import HyprlandControl from "./control-center/hyprland-control";
import { initToggleState, openContextMenu } from "../helper/behaviour";
import NetworkControl from "./control-center/network-control";
import BluetoothControl from "./control-center/bluetooth-control";

export default function ControlCenter({ onDragUp, onDragDown }: { onDragUp?: () => void, onDragDown?: () => void }) {
    const [toggleContentState, settoggleContentState] = createState(false);
    initToggleState("ControlCenter", settoggleContentState);

    function onRightClicked() { openContextMenu("control-center.tsx"); }

    return (
        <box cssClasses={["card"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel isActive={toggleContentState} name={"CONTROL CENTER"} onClicked={() => panelClicked("ControlCenter", settoggleContentState)} draggable onDragUp={onDragUp} onDragDown={onDragDown} onRightClick={onRightClicked} tooltipText={TOOLTIP_TEXT_CONTEXT_MENU}/>
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        <box cssClasses={["contents"]} orientation={Gtk.Orientation.VERTICAL} css={`padding: 10px;`} hexpand>
                            <ControlKey />
                            <AudioControl />
                            <HyprlandControl />
                            <NetworkControl />
                            <BluetoothControl />
                        </box>
                    </box>
                )}
            </With>
        </box>
    );
}