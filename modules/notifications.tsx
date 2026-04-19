import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import AstalNotifd from "gi://AstalNotifd"
import Pango from "gi://Pango"
import { Align, AudioFile, CreateEntryContent, formatTime, HOME_DIR, ICON_DIR, playSound } from "../helper"
import { createState } from "ags"
import { execAsync } from "ags/process"
import { timeout } from "ags/time"
import { Corner, drawChamferedBackground} from "../helper/draw-function"

function isIcon(icon?: string | null) {
  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!)
  return icon && iconTheme.has_icon(icon)
}

function fileExists(path: string) {
  return GLib.file_test(path, GLib.FileTest.EXISTS)
}

function urgency(n: AstalNotifd.Notification) {
  const { LOW, NORMAL, CRITICAL } = AstalNotifd.Urgency
  switch (n.urgency) {
    case LOW:
      return "low"
    case CRITICAL:
      return "critical"
    case NORMAL:
    default:
      return "normal"
  }
}

function initHandler(self: Gtk.Box, mute: boolean) {
  let urgency = self.get_css_classes()

  if (mute) return;
  if (urgency.includes("critical")) {
    playSound(AudioFile.Error)
  } else {
    playSound(AudioFile.Notification)
  }
}

interface NotificationProps {
  notification: AstalNotifd.Notification,
  mute: boolean,
  stackCount?: number,
  onDismiss?: () => void,
}

export default function Notification({ notification: n, mute, stackCount = 1, onDismiss }: NotificationProps) {
  const [toggleVerbosityState, setToggleVerbosityState] = createState(false);
  timeout(50, () => { execAsync('ags request "getNotificationVerbosityState"').then(out => setToggleVerbosityState(out === 'true')) });

  return (
    <box $={(self) => initHandler(self, mute) } spacing={5} cssClasses={["notification", `${urgency(n)}`]} orientation={Gtk.Orientation.VERTICAL} valign={Align.LEFT} vexpand={false}>
      <box class="header" valign={Align.CENTER} spacing={5} halign={Align.FILL} hexpand>
        <image visible={urgency(n) === "critical"} file={`${HOME_DIR}/.config/ags/assets/critical.svg`} pixelSize={16} />
        {((isIcon(n.appIcon) || isIcon(n.desktopEntry) ) && urgency(n) !== "critical") && (
          <image visible={Boolean(n.appIcon || n.desktopEntry)} iconName={n.appIcon || n.desktopEntry} pixelSize={14} />
        )}
        <box hexpand halign={Align.FILL}>
          <label cssClasses={["title"]} justify={Gtk.Justification.LEFT} halign={Align.FILL} hexpand xalign={0} label={n.summary || "NO SUMMARY"} wrap={false} singleLineMode ellipsize={Pango.EllipsizeMode.END} />
        </box>
        <box cssClasses={["entry"]} spacing={5} valign={Align.BOTTOM}>
          <CreateEntryContent name="TIME" value={formatTime(n.time)?.toUpperCase() || "UNKNOWN"} orientation={Gtk.Orientation.HORIZONTAL}/>
          <CreateEntryContent visible={stackCount > 1} name="STACKING" value={stackCount} orientation={Gtk.Orientation.HORIZONTAL}/>
        </box>
        <button onClicked={() => onDismiss ? onDismiss() : n.dismiss()} cssClasses={["close-button"]} hexpand={false} halign={Align.RIGHT} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
          <image file={`${ICON_DIR}/vaadin--close-small.svg`} pixelSize={13} />
        </button>
      </box>
      <Gtk.Separator visible />
      <box spacing={7} homogeneous={false} halign={Align.FILL} hexpand={true}>
        {n.image && fileExists(n.image) && (
          <image valign={Align.LEFT} pixelSize={40} file={n.image} />
        )}
        {n.image && isIcon(n.image) && (
          <box valign={Align.LEFT}>
            <image iconName={n.image} halign={Align.LEFT} valign={Align.LEFT} />
          </box>
        )}
        <box spacing={5} homogeneous={false} halign={Align.FILL} hexpand={true} orientation={Gtk.Orientation.VERTICAL}>
              <box visible={toggleVerbosityState} spacing={5} homogeneous={false} halign={Align.FILL} hexpand={true}>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand={true}>
                  <CreateEntryContent name="NOTIFICATION ID" value={String(n.id)?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="APPLICATION NAME" value={n.appName.toUpperCase() || "UNKNOWN"} allowCopy hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand={true}>
                  <CreateEntryContent name="CATEGORY" value={n.category?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="EXPIRE TIMEOUT" value={String(n.expireTimeout)?.toUpperCase() || "UNKNOWN"} hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL} hexpand={true}>
                  <CreateEntryContent name="DESKTOP ENTRY" value={n.desktopEntry?.toUpperCase() || "UNKNOWN"} hexpand ellipsize={Pango.EllipsizeMode.END} allowCopy />
                  <CreateEntryContent name="TIME" value={formatTime(n.time)?.toUpperCase() || "UNKNOWN"} hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL}>
                  <CreateEntryContent name="APP ICON" value={n.appIcon?.toUpperCase() || "UNKNOWN"} hexpand ellipsize={Pango.EllipsizeMode.END} />
                  <CreateEntryContent name="IMAGE" value={n.image?.toUpperCase() || "UNKNOWN"} hexpand ellipsize={Pango.EllipsizeMode.END} />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Align.FILL}>
                  <CreateEntryContent name="URGENCY" value={urgency(n)?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="ACTIONS" value={String(n.actions.length).toUpperCase() || "UNKNOWN"} hexpand />
                </box>
              </box>
          <box cssClasses={["entry"]} homogeneous={false} spacing={10} halign={Align.FILL} vexpand>
            <CreateEntryContent name="BODY" value={n.body.toUpperCase() || "NO BODY"} allowCopy />
          </box>
          {n.actions.length > 0 && (
            <box spacing={7}>
              {n.actions.map(({ label, id }) => {
                return (
                <button hexpand cssClasses={["action-button", "clickable"]} onClicked={() => n.invoke(id)} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
                  <overlay>
                    <drawingarea halign={Align.FILL} hexpand css={"min-height: 27px;"} $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, backgroundColor: "#152052", notchPlacements: [ {corner: Corner.BottomRight}]}))} />
                    <box $type="overlay" spacing={5} halign={Align.CENTER} valign={Align.CENTER}>
                      <label label={label} halign={Align.CENTER} />
                      <image file={`${ICON_DIR}/majesticons--open.svg`} pixelSize={12} />
                    </box>
                    <label $type="overlay" label={id} cssClasses={["uppercase", "decoration-text"]} css={"margin: 4px;"} halign={Align.LEFT} valign={Align.LEFT} vexpand />
                  </overlay>
                </button>
                )
              })}
            </box>
          )}
        </box>
      </box>
    </box>
  )
}