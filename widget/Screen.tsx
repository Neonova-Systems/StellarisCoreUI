import { Gtk } from "ags/gtk4"
import Wallpaper from "../modules/wallpaper"

export default function Screen() {

    return (
        <box cssClasses={["screen"]} hexpand={false} halign={Gtk.Align.FILL} vexpand={true}>
            <overlay>
                <Wallpaper $type="overlay"/>
                {/* <box $type="overlay" orientation={Gtk.Orientation.HORIZONTAL} spacing={10} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} css={'padding: 10px;'} hexpand> */}
                <Gtk.Grid $type="overlay" cssClasses={["debug"]} columnSpacing={10} rowSpacing={10} css="padding: 20px;" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand $={(grid) => {
                    const cols = 10; // Number of columns per row
                    for (let i = 0; i < 27; i++) {
                        const row = Math.floor(i / cols);
                        const col = i % cols;
                        const box = <box cssClasses={["debug"]} css={"min-height: 50px; min-width: 50px;"} /> as any;
                        grid.attach(box, col, row, 1, 1);
                    }
                }} />
            </overlay>
        </box>
    )
}