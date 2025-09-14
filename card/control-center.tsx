import { createState, With } from "ags";
import { CreatePanel } from "../helper";
import { Gtk } from "ags/gtk4"

export default function ControlCenter() {
    const [toggleContentState, settoggleContentState] = createState(false);
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={"CONTROL CENTER"} onClicked={() => {}} />
            <With value={toggleContentState}>
                {(v) => (
                    <box visible={v} cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                    </box>
                )}
            </With>
        </box>
    );
}