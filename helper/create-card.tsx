import { Gtk } from "ags/gtk4"
import { Accessor, createState, With } from "ags";
import CreatePanel from "../helper/create-panel";
import GLib from "gi://GLib?version=2.0";

const HOME_DIR = GLib.get_home_dir();
type CardProps = {
    name?: string | Accessor<string> | undefined;
    children?: JSX.Element | Array<JSX.Element>
};
export default function CreateCard({ name, children }: CardProps) {
    const [toggleContentState, settoggleContentState] = createState(true);

    function panelClicked() {
        const currentState = toggleContentState.get();
        settoggleContentState(!currentState);
    }
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <CreatePanel name={name} onClicked={panelClicked}>
                <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/>
            </CreatePanel>
            <With value={toggleContentState}>
                {(v) => v && ( 
                    <box cssClasses={["card-content"]} orientation={Gtk.Orientation.VERTICAL}>
                        {children}
                    </box>
                )}
            </With>
        </box>
    )
}
