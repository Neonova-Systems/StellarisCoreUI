import { Gtk } from "ags/gtk4";

type CardProps = {
    children?: JSX.Element | Array<JSX.Element>;
}

export default function CreateCard({children} : CardProps){
    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            {children}
        </box>
    );
}