import { Accessor, createState, With } from "ags"
import { execAsync } from "ags/process"
import { interval, timeout } from "ags/time"
import { Gtk } from "ags/gtk4"
import { Align, CreateEntryContent, CreateSlider, HOME_DIR, ICON_DIR, initToggleState } from "../../helper"
import { Corner, drawChamferedBackground } from "../../helper/draw-function"
import CreateUtilityButton from "../../helper/create-utility-button"
import CreateValueWatcher from "../../helper/create-value-watcher"

type PwDumpMetadataRow = {
    key?: unknown
    value?: unknown
}

type PwDumpObject = {
    type?: unknown
    props?: Record<string, unknown>
    metadata?: PwDumpMetadataRow[]
    info?: {
        props?: Record<string, unknown>
        metadata?: PwDumpMetadataRow[]
    }
}

export default function AudioControl() {
    const volumeDebounceMs = 30
    let deviceInfoRefreshInFlight = false

    const [sinkName, setSinkName] = createState("N/A")
    const [sinkDescription, setSinkDescription] = createState("N/A")
    const [sinkMediaClass, setSinkMediaClass] = createState("N/A")
    const [sinkPath, setSinkPath] = createState("N/A")
    const [sourceName, setSourceName] = createState("N/A")
    const [sourceDescription, setSourceDescription] = createState("N/A")
    const [sourceMediaClass, setSourceMediaClass] = createState("N/A")
    const [sourcePath, setSourcePath] = createState("N/A")
    const deviceSetters = [setSinkName, setSinkDescription, setSinkMediaClass, setSinkPath, setSourceName, setSourceDescription, setSourceMediaClass, setSourcePath]

    const [speakerVolume, setSpeakerVolume] = createState(0)
    const [speakerMuted, setSpeakerMuted] = createState(false)
    let speakerDebounceRevision = 0
    const [micVolume, setMicVolume] = createState(0)
    const [micMuted, setMicMuted] = createState(false)
    let micDebounceRevision = 0

    const [verboseInformation, setVerboseInformation] = createState(false)
    initToggleState("AudioControlVerbosity", setVerboseInformation, 100)

    function toggleVerbosity() {
        execAsync(`ags request "toggle AudioControlVerbosity"`).then((out) => setVerboseInformation(out === "true"))
    }

    function pickOrNA(value: unknown) {
        let text = ""
        if (typeof value === "string") text = value
        else if (typeof value === "number" || typeof value === "boolean") text = String(value)
        return text.trim().length > 0 ? text.trim() : "N/A"
    }

    function getObjectProps(obj?: PwDumpObject) {
        return obj?.info?.props ?? obj?.props
    }

    function getObjectMetadata(obj?: PwDumpObject) {
        return obj?.info?.metadata ?? obj?.metadata
    }

    function getDefaultNodeName(objects: PwDumpObject[], key: string) {
        const metadataDefault = objects.find((obj) => {
            if (obj.type !== "PipeWire:Interface:Metadata") return false
            return getObjectProps(obj)?.["metadata.name"] === "default"
        })

        const row = getObjectMetadata(metadataDefault)?.find((m) => m.key === key)
        if (!row) return ""

        if (typeof row.value === "object" && row.value !== null) {
            const named = row.value as { name?: unknown }
            const val = named.name
            return (typeof val === "string" || typeof val === "number" || typeof val === "boolean") ? String(val) : ""
        }

        if (typeof row.value === "string") {
            try {
                const parsed = JSON.parse(row.value) as { name?: unknown }
                const val = parsed.name
                return (typeof val === "string" || typeof val === "number" || typeof val === "boolean") ? String(val) : ""
            } catch {
                return ""
            }
        }

        return ""
    }

    function refreshDeviceInfo() {
        if (deviceInfoRefreshInFlight) return
        deviceInfoRefreshInFlight = true

        execAsync("pw-dump")
            .then((out) => {
                const objects = JSON.parse(out) as PwDumpObject[]
                const sinkNodeName = getDefaultNodeName(objects, "default.audio.sink")
                const sourceNodeName = getDefaultNodeName(objects, "default.audio.source")

                const sinkNode = objects.find((obj) => obj.type === "PipeWire:Interface:Node" && getObjectProps(obj)?.["node.name"] === sinkNodeName)
                const sourceNode = objects.find((obj) => obj.type === "PipeWire:Interface:Node" && getObjectProps(obj)?.["node.name"] === sourceNodeName)

                const sinkProps = getObjectProps(sinkNode)
                const sourceProps = getObjectProps(sourceNode)

                setSinkName(pickOrNA(sinkProps?.["node.name"]))
                setSinkDescription(pickOrNA(sinkProps?.["node.description"] ?? sinkProps?.["node.nick"]))
                setSinkMediaClass(pickOrNA(sinkProps?.["media.class"]))
                setSinkPath(pickOrNA(sinkProps?.["object.path"]))

                setSourceName(pickOrNA(sourceProps?.["node.name"]))
                setSourceDescription(pickOrNA(sourceProps?.["node.description"] ?? sourceProps?.["node.nick"]))
                setSourceMediaClass(pickOrNA(sourceProps?.["media.class"]))
                setSourcePath(pickOrNA(sourceProps?.["object.path"]))
            })
            .catch((e) => {
                print(`AudioControl refreshDeviceInfo error: ${e}`)
                deviceSetters.forEach(setter => setter("N/A"))
            })
            .finally(() => {
                deviceInfoRefreshInFlight = false
            })
    }

    function refreshVolume(target: string, setVolume: (v: number) => void, setMuted: (v: boolean) => void) {
        execAsync(`wpctl get-volume ${target}`)
            .then((out) => {
                const match = out.match(/([0-9]*\.?[0-9]+)/)
                const normalized = match ? Number.parseFloat(match[1]) : 0
                const percent = Math.max(0, Math.min(100, Math.round(normalized * 100)))
                setVolume(percent)
                setMuted(out.includes('[MUTED]'))
            })
            .catch(() => { setVolume(0); setMuted(false) })
    }

    function refreshSpeakerVolume() { refreshVolume("@DEFAULT_AUDIO_SINK@", setSpeakerVolume, setSpeakerMuted) }
    function refreshMicVolume() { refreshVolume("@DEFAULT_AUDIO_SOURCE@", setMicVolume, setMicMuted) }

    function handleSpeakerVolume(nextPercent: number) {
        const clamped = Math.max(0, Math.min(100, Math.round(nextPercent)))
        if (Math.abs(clamped - speakerVolume.peek()) < 1) return
        setSpeakerVolume(clamped)
        speakerDebounceRevision += 1
        const currentRevision = speakerDebounceRevision
        timeout(volumeDebounceMs, () => {
            if (currentRevision !== speakerDebounceRevision) return
            execAsync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${(speakerVolume.peek() / 100).toFixed(2)}`).then(() => refreshSpeakerVolume()).catch((e) => print(e))
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
            execAsync(`wpctl set-volume @DEFAULT_AUDIO_SOURCE@ ${(micVolume.peek() / 100).toFixed(2)}`).then(() => refreshMicVolume()).catch((e) => print(e))
        })
    }

    function renderVolumeControl(type: string, volume: Accessor<number>, muted: Accessor<boolean>, onToggleMute: () => void, onChangeVolume: (v: number) => void) {
        return (
            <box cssClasses={["volume-control-row"]} spacing={8} valign={Align.CENTER} halign={Align.FILL} hexpand vexpand>
                <button cssClasses={["volume-mute-button", "clickable"]} onClicked={onToggleMute}>
                    <label label={muted(v => v ? "muted" : type)} />
                </button>
                <box cssClasses={["entry"]}>
                    <CreateEntryContent name={"VOL PERCENT"} animation={false} value={volume} watchValue addPercentSuffix/>
                </box>
                <CreateSlider value={volume} onChange={onChangeVolume} disabled={muted} />
            </box>
        )
    }

    const toggleSpeakerMute = () => execAsync('wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle').then(() => refreshSpeakerVolume()).catch((e) => print(e))
    const toggleMicMute = () => execAsync('wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle').then(() => refreshMicVolume()).catch((e) => print(e))
    const openSettings = () => execAsync(`/usr/bin/env pavucontrol`)

    timeout(300, () => { refreshSpeakerVolume(); refreshMicVolume(); refreshDeviceInfo() })
    interval(1000, () => { refreshSpeakerVolume(); refreshMicVolume() })
    interval(33000, () => { refreshDeviceInfo() })
    return (
        <box marginTop={10}>
            <overlay>
                <With value={verboseInformation}>
                    {(v) => {
                        const size = v ? "220" : "120";
                        return (
                            <drawingarea halign={Align.FILL} valign={Align.FILL} hexpand css={`min-height: ${size}px;`} $={(self) => self.set_draw_func((area, cr, width, height) => drawChamferedBackground({ area, cr, width, height, notchSize: 13, backgroundAlpha: 0.13, borderAlpha: 1.0, borderColor: "#0B1233", borderSize: 1.7, notchPlacements: [{ corner: Corner.BottomRight }], }))} /> 
                        )
                    }}
                </With>
                <box cssClasses={["content"]} $type="overlay" orientation={Gtk.Orientation.VERTICAL} spacing={7} halign={Align.FILL} hexpand vexpand>
                    <box spacing={5} valign={Align.TOP} halign={Align.LEFT} vexpand>
                        <image file={`${HOME_DIR}/.config/ags/assets/ornament/frame-01.svg`} pixelSize={15}/>
                        <label cssClasses={["title"]} label="AUDIO CONTROL"/>
                        <CreateUtilityButton imageFile={`${ICON_DIR}/majesticons--open.svg`} tooltipText={"Open audio setting\n\n<span size='small'>[pavucontrol]</span>"} pixelSize={8} onClicked={openSettings}/>
                        <With value={verboseInformation}>
                            {(v) => <CreateUtilityButton imageFile={v ? `${ICON_DIR}/mdi--eye.svg` : `${ICON_DIR}/mdi--eye-off.svg`} tooltipText={"Hide detailed audio device information for a cleaner, compact view"} pixelSize={8} onClicked={toggleVerbosity}/> }
                        </With>
                    </box>
                    <CreateValueWatcher value={verboseInformation}>
                        {(v) => <box visible={v} cssClasses={["entry"]} halign={Align.FILL} marginStart={5} marginEnd={5} spacing={5}>
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand>
                                <CreateEntryContent name={"SINK NAME"} animation={false} value={sinkName} watchValue />
                                <CreateEntryContent name={"SINK CLASS"} animation={false} value={sinkMediaClass} watchValue vexpand/>
                            </box>
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand>
                                <CreateEntryContent name={"SINK LABEL"} animation={false} value={sinkDescription} watchValue />
                                <CreateEntryContent name={"SINK PATH"} animation={false} value={sinkPath} watchValue vexpand/>
                            </box>
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL} hexpand>
                                <CreateEntryContent name={"SOURCE NAME"} animation={false} value={sourceName} watchValue />
                                <CreateEntryContent name={"SOURCE CLASS"} animation={false} value={sourceMediaClass} watchValue vexpand/>
                            </box>
                            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Align.FILL}>
                                <CreateEntryContent name={"SOURCE LABEL"} animation={false} value={sourceDescription} watchValue />
                                <CreateEntryContent name={"SOURCE PATH"} animation={false} value={sourcePath} watchValue vexpand/>
                            </box>
                        </box>
                        }
                    </CreateValueWatcher>
                    {renderVolumeControl("speaker", speakerVolume, speakerMuted, toggleSpeakerMute, handleSpeakerVolume)}
                    {renderVolumeControl("microphone", micVolume, micMuted, toggleMicMute, handleMicVolume)}
                </box>
            </overlay>
        </box>
    )
}