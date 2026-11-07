import { createBinding, createState, With } from "ags"
import { Gtk } from "ags/gtk4"
import { interval, timeout } from "ags/time"
import { execAsync } from "ags/process"
import Pango from "gi://Pango"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { Align, CreateEntryContent, CreateSlider, HOME_DIR, ICON_DIR } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"
import CreateUtilityButton from "../../helper/create-utility-button"

const hyprland = AstalHyprland.get_default()
const SCRIPT_DIR = `${HOME_DIR}/.config/ags/scripts`
const MAX_GAP = 100
const gapDebounceMs = 40
const brightnessDebounceMs = 40

export default function HyprlandControl() {
  const openWev = () => execAsync(`foot -e wev`)

  // Live bindings for the currently focused Hyprland client and workspace.
  const focusedClient = createBinding(hyprland, "focusedClient")
  const focusedWorkspace = createBinding(hyprland, "focusedWorkspace")

  // Inner/outer gap sizes are not exposed by AstalHyprland, so poll hyprctl.
  const [innerGap, setInnerGap] = createState(0)
  const [outerGap, setOuterGap] = createState(0)
  const [brightness, setBrightness] = createState(0)
  const [brightnessAvailable, setBrightnessAvailable] = createState(false)
  let gapDebounceRevision = 0
  let brightnessDebounceRevision = 0

  function readGapOption(option: string): Promise<number> {
    return execAsync(`hyprctl getoption ${option} -j`)
      .then((out) => {
        const css = (JSON.parse(out) as { css?: string }).css ?? ""
        const first = css.trim().split(/\s+/)[0]
        const n = Number(first)
        return Number.isFinite(n) ? n : 0
      })
      .catch(() => 0)
  }

  function refreshGaps() {
    readGapOption("general:gaps_in").then((value) => setInnerGap(value))
    readGapOption("general:gaps_out").then((value) => setOuterGap(value))
  }

  function applyGaps(nextPercent: number) {
    const clamped = Math.max(0, Math.min(MAX_GAP, Math.round(nextPercent)))
    if (Math.abs(clamped - innerGap.peek()) < 1) return
    setInnerGap(clamped)
    gapDebounceRevision += 1
    const currentRevision = gapDebounceRevision
    timeout(gapDebounceMs, () => {
      if (currentRevision !== gapDebounceRevision) return
      const value = innerGap.peek()
      execAsync(`bash ${SCRIPT_DIR}/set-innergap-ratio ${value}`)
        .then(() => refreshGaps())
        .catch((e) => print(e))
    })
  }

  function applyBrightness(nextPercent: number) {
    const clamped = Math.max(0, Math.min(100, Math.round(nextPercent)))
    if (clamped === brightness.peek()) return
    setBrightness(clamped)
    brightnessDebounceRevision += 1
    const currentRevision = brightnessDebounceRevision
    timeout(brightnessDebounceMs, () => {
      if (currentRevision !== brightnessDebounceRevision) return
      execAsync(`bash ${SCRIPT_DIR}/set-brightness ${brightness.peek()}`)
        .then((out) => {
          // The script floors 0 to 1 and echoes what the device accepted, so
          // trust that over the requested value.
          const applied = Number(out.trim())
          if (Number.isFinite(applied) && applied !== brightness.peek()) setBrightness(applied)
        })
        .catch((e) => print(e))
    })
  }

  // Brightness is read once on mount and never polled: a poll would overwrite the
  // slider mid-drag the way gap polling once inflated the value on every toggle.
  function refreshBrightness() {
    execAsync(`bash ${SCRIPT_DIR}/get-brightness`)
      .then((out) => {
        const value = Number(out.trim())
        if (!Number.isFinite(value)) throw new Error(`unexpected brightness output: ${out}`)
        setBrightness(value)
        setBrightnessAvailable(true)
      })
      .catch(() => setBrightnessAvailable(false))
  }

  // Read gaps immediately on mount so slider shows correct value at startup.
  refreshGaps()
  refreshBrightness()
  interval(2500, refreshGaps)
  return (
    <box marginTop={10}>
      <overlay>
        <box css={`min-height: 150px;`}>
          <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({ area, cr, width, height, notchSize: 13, backgroundColor: "#000000", backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{ corner: Corner.BottomRight }], }))} />
        </box>
        <box cssClasses={["content"]} $type="overlay" orientation={Gtk.Orientation.VERTICAL} spacing={7} halign={Align.FILL} hexpand vexpand>
          <box spacing={5} valign={Align.TOP} halign={Align.LEFT}>
            <image file={`${HOME_DIR}/.config/ags/assets/ornament/frame-01.svg`} pixelSize={15} />
            <label cssClasses={["title", "text-uppercase", "font-main"]} label="HYPRLAND CONTROL" />
            <CreateUtilityButton imageFile={`${ICON_DIR}/mdi--keyboard.svg`} tooltipText={"Open wev event viewer\n\nDisplay keyboard inputs, keycodes,\nand key bindings in real-time"} pixelSize={8} onClicked={openWev} />
          </box>
          <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
            <box cssClasses={["entry"]} spacing={12} halign={Align.FILL}>
              <CreateEntryContent name={"INNER GAP"} animation={false} value={innerGap} watchValue />
              <CreateEntryContent name={"OUTER GAP"} animation={false} value={outerGap} watchValue />
            </box>
            <CreateSlider value={innerGap} onChange={applyGaps} />
          </box>
          <With value={brightnessAvailable}>
            {(available: boolean) => (
              <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
                <box cssClasses={["entry"]} spacing={12} halign={Align.FILL}>
                  <CreateEntryContent
                    name={"BRIGHTNESS"}
                    animation={false}
                    value={brightness((v: number) => (available ? v : "N/A"))}
                    watchValue={available}
                  />
                </box>
                <CreateSlider value={brightness} onChange={applyBrightness} disabled={!available} />
              </box>
            )}
          </With>
          <With value={focusedClient}>
            {(client: any) => client ? (
              <box orientation={Gtk.Orientation.VERTICAL} cssClasses={["entry"]} spacing={6} halign={Align.FILL}>
                <CreateEntryContent name={"TITLE"} animation={false} value={createBinding(client, "title")} watchValue ellipsize={Pango.EllipsizeMode.END} />
                <box orientation={Gtk.Orientation.HORIZONTAL} cssClasses={["entry"]} spacing={10} halign={Align.FILL}>
                  <CreateEntryContent name={"CLASS"} animation={false} value={createBinding(client, "class")} watchValue ellipsize={Pango.EllipsizeMode.END} hexpand />
                  <CreateEntryContent name={"STATE"} animation={false} value={createBinding(client, "floating")((floating: boolean) => floating ? "FLOATING" : "TILED")} watchValue />
                </box>
              </box>
            ) : (
              <box cssClasses={["entry"]}>
                <CreateEntryContent name={"FOCUSED"} animation={false} value={"NO CLIENT"} />
              </box>
            )}
          </With>
          <With value={focusedWorkspace}>
            {(workspace: any) => {
              if (!workspace) return <box />;
              const workspaceName = createBinding(workspace, "name")((name: string) => {
                if (!name) return String(workspace.id);
                return name !== String(workspace.id) ? `${workspace.id} [${name}]` : String(workspace.id);
              });
              return (
                <box cssClasses={["entry"]} orientation={Gtk.Orientation.HORIZONTAL} spacing={10} halign={Align.FILL}>
                  <CreateEntryContent name={"WORKSPACE"} animation={false} value={workspaceName} watchValue />
                  <CreateEntryContent name={"MONITOR"} animation={false} value={workspace.monitor?.name ?? "N/A"} hexpand />
                  <CreateEntryContent name={"CLIENTS"} animation={false} value={String(workspace.clients?.length ?? 0)} />
                </box>
              );
            }}
          </With>
        </box>
      </overlay>
    </box>
  )
}