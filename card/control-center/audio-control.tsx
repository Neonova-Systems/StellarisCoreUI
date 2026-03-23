import { createState, With } from "ags"
import { execAsync } from "ags/process"
import { interval, timeout } from "ags/time"
import { Gtk } from "ags/gtk4"
import { Align, CreateEntryContent, CreateSlider, HOME_DIR, ICON_DIR } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"
import CreateUtilityButton from "../../helper/create-utility-button"

export default function AudioControl() {
    const volumeDebounceMs = 30
    const [volumePercent, setVolumePercent] = createState(0)
    const [isMuted, setIsMuted] = createState(false)
    let debounceRevision = 0

    function refreshVolume() {
        execAsync('wpctl get-volume @DEFAULT_AUDIO_SINK@')
            .then((out) => {
                const volumeMatch = out.match(/([0-9]*\.?[0-9]+)/)
                const normalized = volumeMatch ? Number.parseFloat(volumeMatch[1]) : 0
                const nextPercent = Math.max(0, Math.min(100, Math.round(normalized * 100)))
                setVolumePercent(nextPercent)
                setIsMuted(out.includes('[MUTED]'))
            })
            .catch(() => {
                setVolumePercent(0)
                setIsMuted(false)
            })
    }

    function setVolume(nextPercent: number) {
        const clamped = Math.max(0, Math.min(100, Math.round(nextPercent)))
        if (Math.abs(clamped - volumePercent.peek()) < 1) return

        setVolumePercent(clamped)

        debounceRevision += 1
        const currentRevision = debounceRevision
        timeout(volumeDebounceMs, () => {
            if (currentRevision !== debounceRevision) return

            const latestPercent = volumePercent.peek()
            execAsync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${(latestPercent / 100).toFixed(2)}`)
                .then(() => refreshVolume())
                .catch((e) => print(e))
        })
    }

    function toggleMute() {
        execAsync('wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle').then(() => refreshVolume()).catch((e) => print(e))
    }

    timeout(300, () => refreshVolume())
    interval(1000, () => refreshVolume())

    return (
        <box marginTop={10}>
            <overlay>
                <box css={`min-height: 110px;`}>
                    <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, notchSize: 13, backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{corner: Corner.BottomRight}], }))} />
                </box>
                <box cssClasses={["content"]} $type="overlay" orientation={Gtk.Orientation.VERTICAL} spacing={5}>
                    <box spacing={5} valign={Align.TOP} halign={Align.LEFT}>
                        <image file={`${HOME_DIR}/.config/ags/assets/ornament/frame-01.svg`} pixelSize={15}/>
                        <label cssClasses={["title"]} label="AUDIO CONTROL"/>
                        <CreateUtilityButton imageFile={`${ICON_DIR}/tabler--refresh.svg`} tooltipText={"Open volume setting"} pixelSize={8} onClicked={() => {}} />
                    </box>
                    <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
                        <button cssClasses={["volume-mute-button", "clickable"]} onClicked={toggleMute}>
                            <label label={isMuted(v => v ? "muted" : "speaker")} />
                        </button>
                        <box cssClasses={["entry"]}>
                            <With value={volumePercent}>
                                {(v) =>  <CreateEntryContent name={"VOL PERCENT"} animation={false} value={`${v}%`} /> }
                            </With>
                        </box>
                        <CreateSlider value={volumePercent} onChange={setVolume} disabled={isMuted} />
                    </box>
                </box>
            </overlay>
        </box>
    )
}