import { Gtk } from "ags/gtk4"
import { CreatePanel } from "../helper"

export default function FavoritesItem() {
    
    return (
        <box cssClasses={["card"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false} hexpand={false}>
            <CreatePanel name={"FAVORITES ITEM"} onClicked={() => {}} />
        </box>
    )
}