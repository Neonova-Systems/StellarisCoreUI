import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"
import AstalTray from "gi://AstalTray?version=0.1"

export default function SystemTray() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, "items")

  const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel
    btn.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
      btn.insert_action_group("dbusmenu", item.actionGroup)
    })
  }

  return (
    <box cssClasses={["system-tray"]} spacing={3}>
      <For each={items}>
        {(item) => (
          <menubutton $={(self) => init(self, item)} tooltipMarkup={item.tooltipMarkup}>
            <image gicon={createBinding(item, "gicon")} pixelSize={13}/>
          </menubutton>
        )}
      </For>
    </box>
  )
}
