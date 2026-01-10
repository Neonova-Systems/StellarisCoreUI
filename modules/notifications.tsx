import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Adw from "gi://Adw"
import GLib from "gi://GLib"
import AstalNotifd from "gi://AstalNotifd"
import Pango from "gi://Pango"
import { CreateEntryContent, formatTime, HOME_DIR, ICON_DIR, playAlertSound, playNotificationsSound, setSourceRGBAFromHex } from "../helper"
import giCairo from "cairo"
import { createState, With } from "ags"
import { execAsync } from "ags/process"
import { timeout } from "ags/time"
import { Corner, drawChamferedButton } from "../helper/draw-function"

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

function initHandler(self: Gtk.Box) {
  let urgency = self.get_css_classes()
  if (urgency.includes("critical")) {
    playAlertSound()
  } else {
    playNotificationsSound()
  }
}

interface NotificationProps {
  notification: AstalNotifd.Notification
}

export default function Notification({ notification: n }: NotificationProps) {
  const [toggleVerbosityState, setToggleVerbosityState] = createState(false);
  timeout(50, () => { execAsync('ags request "getNotificationVerbosityState"').then(out => setToggleVerbosityState(out === 'true')) });

  return (
    <box $={initHandler} spacing={5} cssClasses={["notification", `${urgency(n)}`]} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.START} vexpand={false}>
      <box class="header" valign={Gtk.Align.CENTER} spacing={5} halign={Gtk.Align.FILL} hexpand>
        <image visible={urgency(n) === "critical"} file={`${HOME_DIR}/.config/ags/assets/critical.svg`} pixelSize={16} />
        {((isIcon(n.appIcon) || isIcon(n.desktopEntry) ) && urgency(n) !== "critical") && (
          <image visible={Boolean(n.appIcon || n.desktopEntry)} iconName={n.appIcon || n.desktopEntry} pixelSize={14} />
        )}
        <label cssClasses={["title"]} label={n.summary || "NO SUMMARY"} ellipsize={3} />
        <box hexpand />
        <button onClicked={() => n.dismiss()} cssClasses={["close-button"]} hexpand={false} halign={Gtk.Align.END} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
          <image file={`${ICON_DIR}/vaadin--close-small.svg`} pixelSize={13} />
        </button>
      </box>
      <Gtk.Separator visible />
      <box spacing={7} homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
        {n.image && fileExists(n.image) && (
          <image valign={Gtk.Align.START} pixelSize={40} file={n.image} />
        )}
        {n.image && isIcon(n.image) && (
          <box valign={Gtk.Align.START}>
            <image iconName={n.image} halign={Gtk.Align.START} valign={Gtk.Align.START} />
          </box>
        )}
        <box spacing={5} homogeneous={false} halign={Gtk.Align.FILL} hexpand={true} orientation={Gtk.Orientation.VERTICAL}>
              <box visible={toggleVerbosityState} spacing={5} homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} hexpand={true}>
                  <CreateEntryContent name="NOTIFICATION ID" value={String(n.id)?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="APPLICATION NAME" value={n.appName.toUpperCase() || "UNKNOWN"} allowCopy hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} hexpand={true}>
                  <CreateEntryContent name="CATEGORY" value={n.category?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="SUPPRESS SOUND" value={String(n.suppressSound)?.toUpperCase() || "UNKNOWN"} hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL} hexpand={true}>
                  <CreateEntryContent name="DESKTOP ENTRY" value={n.desktopEntry?.toUpperCase() || "UNKNOWN"} hexpand ellipsize={Pango.EllipsizeMode.END} allowCopy />
                  <CreateEntryContent name="TRANSIENT" value={String(n.transient)?.toUpperCase() || "UNKNOWN"} hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL}>
                  <CreateEntryContent name="EXPIRE TIMEOUT" value={String(n.expireTimeout)?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="RESIDENT" value={String(n.resident)?.toUpperCase() || "UNKNOWN"} hexpand />
                </box>
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={5} halign={Gtk.Align.FILL}>
                  <CreateEntryContent name="URGENCY" value={urgency(n)?.toUpperCase() || "UNKNOWN"} hexpand />
                  <CreateEntryContent name="TIME" value={formatTime(n.time)?.toUpperCase() || "UNKNOWN"} hexpand />
                </box>
              </box>
          <box cssClasses={["entry"]} homogeneous={false} spacing={10} halign={Gtk.Align.FILL} vexpand>
            <CreateEntryContent name="BODY" value={n.body.toUpperCase() || "NO BODY"} allowCopy />
          </box>
          {n.actions.length > 0 && (
            <box spacing={7}>
              {n.actions.map(({ label, id }) => {
                return (
                <button hexpand cssClasses={["action-button", "clickable"]} onClicked={() => n.invoke(id)} cursor={Gdk.Cursor.new_from_name("pointer", null)}>
                  <overlay>
                    <drawingarea halign={Gtk.Align.FILL} hexpand css={"min-height: 27px;"} $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedButton({area, cr, width, height, notchPlacements: [ {corner: Corner.BottomRight}]}))} />
                    <box $type="overlay" spacing={5} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                      <label label={label} halign={Gtk.Align.CENTER} />
                      <image file={`${ICON_DIR}/majesticons--open.svg`} pixelSize={12} />
                    </box>
                    <label $type="overlay" label="action" cssClasses={["uppercase", "decoration-text"]} css={"margin: 4px;"} halign={Gtk.Align.START} valign={Gtk.Align.START} vexpand />
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