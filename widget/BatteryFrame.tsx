import { createBinding } from "ags"
import { Gtk } from "ags/gtk4"
import AstalBattery from "gi://AstalBattery?version=0.1"

export default function BatteryFrame() {
    const battery = AstalBattery.get_default()
    const percentage = createBinding(battery, "percentage")
    const status = createBinding(battery, "charging")((v) => v ? "CHARGING" : "DISCHARGING")
    return ( <box cssClasses={["battery"]} spacing={10} homogeneous={false} visible={createBinding(battery, "isPresent")} hexpand={false}>
        <box cssClasses={["special-entry"]} spacing={2}>
            <label label="CURRENT BATTERY:" halign={Gtk.Align.START} />
            <label cssClasses={["value"]} label={`${Math.floor(percentage.get() * 100)}%`} halign={Gtk.Align.START} />
        </box>
        <levelbar value={percentage} hexpand />
        <box spacing={5}>
            <box cssClasses={["special-entry"]} spacing={2} valign={Gtk.Align.END}>
                <label label="BATTERY STATUS:" halign={Gtk.Align.START} />
                <label cssClasses={["value"]} label={status} halign={Gtk.Align.START} />
            </box>
            <image iconName={createBinding(battery, "iconName")} pixelSize={13} valign={Gtk.Align.START}/>
        </box>
    </box>)
}
