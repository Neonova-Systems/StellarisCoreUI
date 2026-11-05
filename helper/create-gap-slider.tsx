import { Accessor } from "ags"
import { Gtk } from "ags/gtk4"
import { Align } from "./constants"
import CreateEntryContent from "./create-entry-content"
import CreateSlider from "./create-slider"

/**
 * Props for the reusable gap slider row.
 *
 * Wraps the gap label + CreateSlider into a single component so it can be
 * reused anywhere (HyprlandControl, context menus, etc.) without duplicating
 * the label/slider markup.
 */
type GapSliderProps = {
  /** Reactive slider value in percent (0..100). */
  value: Accessor<number>
  /** Called when user interaction requests a new slider percent value. */
  onChange: (nextPercent: number) => void
  /** Optional label text; defaults to "INNER GAP". */
  label?: string
  /** When true or accessor evaluates true, disables interaction. */
  disabled?: boolean | Accessor<boolean>
}

export default function GapSlider(props: GapSliderProps) {
  const { value, onChange, label = "INNER GAP", disabled } = props
  return (
    <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
      <box cssClasses={["entry"]} spacing={12} halign={Align.FILL}>
        <CreateEntryContent name={label} animation={false} value={value} watchValue />
      </box>
      <CreateSlider value={value} onChange={onChange} disabled={disabled} />
    </box>
  )
}