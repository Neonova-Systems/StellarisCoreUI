import { createState, With } from "ags"
import { execAsync } from "ags/process"
import { interval, timeout } from "ags/time"
import { Gtk } from "ags/gtk4"
import { Align, HOME_DIR } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"

export default function AudioControl() {
    const segmentCount = 24
    const volumeDebounceMs = 30
    const segments = Array.from({ length: segmentCount })
    const [volumePercent, setVolumePercent] = createState(0)
    const [isMuted, setIsMuted] = createState(false)
    const [isDraggingSegments, setIsDraggingSegments] = createState(false)
    let debounceRevision = 0
    let dragStartX = 0
    let trackWidget: Gtk.Box | null = null

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
        execAsync('wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle')
            .then(() => refreshVolume())
            .catch((e) => print(e))
    }

    function setVolumeFromSegment(index: number) {
        const next = Math.round(((index + 1) / segmentCount) * 100)
        setVolume(next)
    }

    function setVolumeFromTrackPosition(x: number) {
        if (!trackWidget) return

        const width = Math.max(trackWidget.get_width(), 1)
        const ratio = Math.max(0, Math.min(1, x / width))
        const index = Math.min(segmentCount - 1, Math.floor(ratio * segmentCount))
        setVolumeFromSegment(index)
    }

    function beginSegmentDrag(self: Gtk.GestureDrag) {
        const [hasPoint, startX] = self.get_start_point()
        dragStartX = hasPoint ? startX : 0
        setIsDraggingSegments(true)
        setVolumeFromTrackPosition(dragStartX)
    }

    function updateSegmentDrag(self: Gtk.GestureDrag) {
        const [, offsetX] = self.get_offset()
        setVolumeFromTrackPosition(dragStartX + offsetX)
    }

    function endSegmentDrag() {
        setIsDraggingSegments(false)
    }

    timeout(300, () => refreshVolume())
    interval(1000, () => refreshVolume())

    return (
        <box marginTop={10}>
            <overlay>
                <box css={`min-height: 110px;`}>
                    <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({area, cr, width, height, notchSize: 13, backgroundColor: "#000000", backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{corner: Corner.BottomRight}], }))} />
                </box>
                <box cssClasses={["content"]} $type="overlay" orientation={Gtk.Orientation.VERTICAL} spacing={5}>
                    <box spacing={5} valign={Align.TOP} halign={Align.LEFT}>
                        <image file={`${HOME_DIR}/.config/ags/assets/ornament/frame-01.svg`} pixelSize={15}/>
                        <label cssClasses={["title"]} label="AUDIO CONTROL"/>
                    </box>
                    <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
                        <button cssClasses={["volume-mute-button"]} onClicked={toggleMute}>
                            <label label={isMuted(v => v ? "muted" : "speaker")} />
                        </button>
                        <box cssClasses={["volume-segment-track"]} spacing={1} halign={Align.FILL} hexpand $={(self) => { trackWidget = self }}>
                            <Gtk.GestureDrag onDragBegin={beginSegmentDrag} onDragUpdate={updateSegmentDrag} onDragEnd={endSegmentDrag} />
                            {segments.map((_, index) => (
                                <button cssClasses={["volume-segment-button"]} onClicked={() => setVolumeFromSegment(index)}>
                                    <With value={volumePercent}>
                                        {(v) => {
                                            const filledCount = Math.max(0, Math.ceil((v / 100) * segmentCount))
                                            const focusIndex = Math.max(0, filledCount - 1)
                                            return (
                                                <box cssClasses={[
                                                    "volume-segment",
                                                    ...(index < filledCount ? ["filled"] : []),
                                                    ...(index === focusIndex ? ["focus"] : []),
                                                    ...(isDraggingSegments.peek() && index === focusIndex ? ["dragging"] : []),
                                                ]} />
                                            )
                                        }}
                                    </With>
                                </button>
                            ))}
                        </box>
                        <With value={volumePercent}>
                            {(v) => <label cssClasses={["volume-value-label"]} label={`${v}%`} halign={Align.RIGHT} widthChars={4} />}
                        </With>
                    </box>
                </box>
            </overlay>
        </box>
    )
}