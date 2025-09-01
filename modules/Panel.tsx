import { Gtk } from "ags/gtk4"
import { Accessor } from "ags"

type PanelProps = {
    name?: string | Accessor<string> | undefined;
    onClicked?: ((source: Gtk.Button) => void) | undefined
    children?: JSX.Element | Array<JSX.Element>
};

export const CreatePanel = ({ name, onClicked, children }: PanelProps) => {
    return (
        <button cssClasses={["panel"]} onClicked={onClicked}>
            <label label={name} halign={Gtk.Align.START}/>
            {children}
        </button>
    )
}
