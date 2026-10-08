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

  // const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
  //     const popover = new Gtk.Popover();
  //     const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 2 });
  //
  //     popover.set_child(box);
  //     btn.set_popover(popover);
  //
  //     const menu = item.menuModel;
  //     if (!menu) return;
  //
  //     let i = 0;
  //     while (i < menu.get_n_items()) {
  //         const labelAttr = menu.get_item_attribute_value(i, "label", null);
  //         const actionAttr = menu.get_item_attribute_value(i, "action", null);
  //
  //         const label = labelAttr ? labelAttr.get_string()[0] : "Menu";
  //         const action = actionAttr ? actionAttr.get_string()[0] : null;
  //
  //         const actionBtn = new Gtk.Button({ label: label });
  //
  //         actionBtn.connect("clicked", () => {
  //             if (action && item.actionGroup) {
  //                 const actionName = action.replace("dbusmenu.", "");
  //                 item.actionGroup.activate_action(actionName, null);
  //             }
  //             popover.popdown();
  //         });
  //
  //         box.append(actionBtn);
  //         i++;
  //     }
  // }

  return (
    <box cssClasses={["system-tray"]} spacing={3}>
      <For each={items}>
        {(item) => (
          <menubutton $={(self) => init(self, item)} tooltipMarkup={item.tooltipMarkup}>
            <image gicon={createBinding(item, "gicon")} pixelSize={13} />
          </menubutton>
        )}
      </For>
    </box>
  )
}
