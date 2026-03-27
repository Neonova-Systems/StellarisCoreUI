import { createState, With } from "ags"
import { execAsync } from "ags/process"
import { interval, timeout } from "ags/time"
import { Gtk } from "ags/gtk4"
import { Align, CreateEntryContent, CreateSlider, HOME_DIR, ICON_DIR } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"
import CreateUtilityButton from "../../helper/create-utility-button"

export default function AudioControl() {
    const volumeDebounceMs = 30
    // Speaker state
    const [speakerVolume, setSpeakerVolume] = createState(0)
    const [speakerMuted, setSpeakerMuted] = createState(false)
    let speakerDebounceRevision = 0
    // Microphone state
    const [micVolume, setMicVolume] = createState(0)
    const [micMuted, setMicMuted] = createState(false)
    let micDebounceRevision = 0

    function refreshSpeakerVolume() {
        execAsync('wpctl get-volume @DEFAULT_AUDIO_SINK@')
            .then((out) => {
                const volumeMatch = out.match(/([0-9]*\.?[0-9]+)/)
                const normalized = volumeMatch ? Number.parseFloat(volumeMatch[1]) : 0
                const nextPercent = Math.max(0, Math.min(100, Math.round(normalized * 100)))
                setSpeakerVolume(nextPercent)
                setSpeakerMuted(out.includes('[MUTED]'))
            })
            .catch(() => {
                setSpeakerVolume(0)
                setSpeakerMuted(false)
            })
    }

    function refreshMicVolume() {
        execAsync('wpctl get-volume @DEFAULT_AUDIO_SOURCE@')
            .then((out) => {
                const volumeMatch = out.match(/([0-9]*\.?[0-9]+)/)
                const normalized = volumeMatch ? Number.parseFloat(volumeMatch[1]) : 0
                const nextPercent = Math.max(0, Math.min(100, Math.round(normalized * 100)))
                setMicVolume(nextPercent)
                setMicMuted(out.includes('[MUTED]'))
            })
            .catch(() => {
                setMicVolume(0)
                setMicMuted(false)
            })
    }

    function handleSpeakerVolume(nextPercent: number) {
        const clamped = Math.max(0, Math.min(100, Math.round(nextPercent)))
        if (Math.abs(clamped - speakerVolume.peek()) < 1) return

        setSpeakerVolume(clamped)

        speakerDebounceRevision += 1
        const currentRevision = speakerDebounceRevision
        timeout(volumeDebounceMs, () => {
            if (currentRevision !== speakerDebounceRevision) return

            const latestPercent = speakerVolume.peek()
            execAsync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${(latestPercent / 100).toFixed(2)}`)
                .then(() => refreshSpeakerVolume())
                .catch((e) => print(e))
        })
    }

    function handleMicVolume(nextPercent: number) {
        const clamped = Math.max(0, Math.min(100, Math.round(nextPercent)))
        if (Math.abs(clamped - micVolume.peek()) < 1) return

        setMicVolume(clamped)

        micDebounceRevision += 1
        const currentRevision = micDebounceRevision
        timeout(volumeDebounceMs, () => {
            if (currentRevision !== micDebounceRevision) return

            const latestPercent = micVolume.peek()
            execAsync(`wpctl set-volume @DEFAULT_AUDIO_SOURCE@ ${(latestPercent / 100).toFixed(2)}`)
                .then(() => refreshMicVolume())
                .catch((e) => print(e))
        })
    }

    function toggleSpeakerMute() { execAsync('wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle').then(() => refreshSpeakerVolume()).catch((e) => print(e)) }
    function toggleMicMute() { execAsync('wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle').then(() => refreshMicVolume()).catch((e) => print(e)) }
    function openSettings() { execAsync(`/usr/bin/env pavucontrol`); }

    timeout(300, () => { refreshSpeakerVolume(); refreshMicVolume(); })
    interval(1000, () => { refreshSpeakerVolume(); refreshMicVolume(); })

    function renderSpeakerControl() {
        return (
            <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
                <button cssClasses={["volume-mute-button", "clickable"]} onClicked={toggleSpeakerMute}>
                    <label label={speakerMuted(v => v ? "muted" : "speaker")} />
                </button>
                <box cssClasses={["entry"]}>
                    <With value={speakerVolume}>
                        {(v) => <CreateEntryContent name={"VOL PERCENT"} animation={false} value={`${v}%`} />}
                    </With>
                </box>
                <CreateSlider value={speakerVolume} onChange={handleSpeakerVolume} disabled={speakerMuted} />
            </box>
        )
    }
    function renderMicrophoneControl() {
        return (
            <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand>
                <button cssClasses={["volume-mute-button", "clickable"]} onClicked={toggleMicMute}>
                    <label label={micMuted(v => v ? "muted" : "microphone")} />
                </button>
                <box cssClasses={["entry"]}>
                    <With value={micVolume}>
                        {(v) => <CreateEntryContent name={"VOL PERCENT"} animation={false} value={`${v}%`} />}
                    </With>
                </box>
                <CreateSlider value={micVolume} onChange={handleMicVolume} disabled={micMuted} />
            </box>
        )
    }
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
                        <CreateUtilityButton imageFile={`${ICON_DIR}/majesticons--open.svg`} tooltipText={"Open audio setting\n\n[pavucontrol]"} pixelSize={8} onClicked={openSettings}/>
                    </box>
                    {renderSpeakerControl()}
                    {renderMicrophoneControl()}
                </box>
            </overlay>
        </box>
    )
}