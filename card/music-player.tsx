import { Accessor, createBinding, createState, For, With } from "ags"
import { CreatePanel, CreateEntryContent, playAlertSound, playPanelSound, HOME_DIR } from "../helper";
import { Gtk } from "ags/gtk4"
import AstalMpris from "gi://AstalMpris?version=0.1";
import { execAsync } from "ags/process";
import { timeout } from "ags/time";


export default function MusicPlayer() {
    const mpris = AstalMpris.get_default()
    const players = createBinding(mpris, "players")

    const [toggleContentState, settoggleContentState] = createState(false);
    const [trackPercentage, setTrackPercentage] = createState(0.0);
    function panelClicked() {
        const currentState = toggleContentState.get();
        settoggleContentState(!currentState);
        (!currentState && players.length > 0 ? playPanelSound() : playAlertSound())
    }

    function formatDuration(lengthInSeconds: number) {
        const totalSeconds = Math.floor(lengthInSeconds > 0 ? lengthInSeconds : 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds}`
    }
    
    function onRightClicked() {
        timeout(300, () => execAsync(`ags run ${HOME_DIR}/.config/ags/window/context-menu/music-player.tsx --gtk 4`).catch((e) => print(e)))
    }

    function getPlaybackStatus(status: AstalMpris.PlaybackStatus) {
        switch (status) {
            case 0:
                return "PLAYING"
            case 1:
                return "PAUSED"
            case 2:
                return "STOPPED"
            default:
                break;
        }
    }
    function getShuffleStatus(status: AstalMpris.Shuffle) {
        switch (status) {
            case 0:
                return "UNSUPPORTED"
            case 1:
                return "ON"
            case 2:
                return "OFF"
            default:
                break;
        }
    }
    function getLoopStatus(status: AstalMpris.Loop) {
        switch (status) {
            case 0:
                return "UNSUPPORTED"
            case 1:
                return "NONE"
            case 2:
                return "TRACK"
            case 3:
                return "PLAYLIST"
            default:
                break;
        }
    }
    function calculateProgress(mpris: AstalMpris.Player.ConstructorProps, currentPosition: number, trackLength: number) {
        // Important: Avoid division by zero if the track length is 0 or not available.
        if (trackLength <= 0) { return 0; }
        if (mpris.playbackStatus > 0) { return trackPercentage; } // Return previous percentage

        // Calculate the progress ratio (a value between 0.0 and 1.0)
        const progressRatio = currentPosition / trackLength;
        const percentage = Math.min(100, Math.max(0, progressRatio * 100));
        setTrackPercentage(percentage)
        return percentage;
    }

    return (
        <box cssClasses={["card-component"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            <Gtk.GestureClick button={3} onPressed={() => onRightClicked()} />
            <CreatePanel name="MUSIC PLAYER" onClicked={panelClicked} />
            <With value={toggleContentState}>
                {(v) => ( 
                    <box visible={v} cssClasses={["card-content"]} valign={Gtk.Align.START}>
                        <For each={players}>
                            {(item) => (
                                <box spacing={5} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.FILL} vexpand={false}>
                                    <box cssClasses={["content"]} spacing={7} homogeneous={false} hexpand={false} vexpand={false}>
                                        <button visible={createBinding(item, "artUrl").get() != ""} onClicked={() => { execAsync(`xdg-open ${item.artUrl}`) }} css="margin-top: 3px;">
                                            <image pixelSize={34} file={createBinding(item, "coverArt")} valign={Gtk.Align.START} />
                                        </button>
                                        <box valign={Gtk.Align.FILL} spacing={0} orientation={Gtk.Orientation.VERTICAL} homogeneous={false} hexpand>
                                            <label cssClasses={["track-title"]} label={createBinding(item, "title")} halign={Gtk.Align.START} ellipsize={3} />
                                            <box homogeneous={false} halign={Gtk.Align.FILL} hexpand={true}>
                                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                                    <CreateEntryContent name="ARTIST NAME" value={createBinding(item, "artist").get().toUpperCase()} hexpand allowCopy/>
                                                    <CreateEntryContent name="PLAYER NAME" value={createBinding(item, "identity").get().toUpperCase()} hexpand allowCopy/>
                                                </box>
                                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                                    <CreateEntryContent name="SHUFFLE STATUS" value={getShuffleStatus(item.shuffleStatus)} hexpand/>
                                                    <CreateEntryContent name="LOOP STATUS" value={getLoopStatus(item.loopStatus)} hexpand/>
                                                </box>
                                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL} hexpand={true}>
                                                    <CreateEntryContent name="TRACK LENGTH" value={formatDuration(createBinding(item, "length").get())} hexpand allowCopy/>
                                                    <CreateEntryContent name="SPEED RATE" value={createBinding(item, "rate").get().toString()} hexpand/>
                                                </box>
                                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                                    <CreateEntryContent name="ELAPSED TIME" value={formatDuration(createBinding(item, "position").get())} hexpand/>
                                                    <CreateEntryContent name="SPEED MIN RATE" value={createBinding(item, "minimumRate").get().toString()} hexpand/>
                                                </box>
                                                <box cssClasses={["entry"]} orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.FILL}>
                                                    <CreateEntryContent name="PLAYBACK STATUS" value={getPlaybackStatus(item.playbackStatus)} hexpand/>
                                                    <CreateEntryContent name="SPEED MAX RATE" value={createBinding(item, "maximumRate").get().toString()} hexpand/>
                                                </box>
                                            </box>
                                        </box>
                                    </box>
                                    <box spacing={7} visible={createBinding(item, "canControl")} halign={Gtk.Align.CENTER} >
                                        <button onClicked={() => item.shuffle()} >
                                            <image file={`${HOME_DIR}/.config/ags/assets/shuffle.svg`} pixelSize={14}/>
                                        </button>
                                        <button onClicked={() => item.previous()} >
                                            <image file={`${HOME_DIR}/.config/ags/assets/backward.svg`} pixelSize={11}/>
                                        </button>
                                        <button css="background-color: #9EA6CC;" onClicked={() => item.play_pause()} >
                                            <box>
                                                <image file={`${HOME_DIR}/.config/ags/assets/play.svg`} pixelSize={16} visible={createBinding(item, "playbackStatus",)((s) => s === AstalMpris.PlaybackStatus.PLAYING)} />
                                                <image file={`${HOME_DIR}/.config/ags/assets/pause.svg`} pixelSize={16} visible={createBinding(item, "playbackStatus")((s) => s !== AstalMpris.PlaybackStatus.PLAYING)} />
                                            </box>
                                        </button>
                                        <button onClicked={() => item.next()} >
                                            <image file={`${HOME_DIR}/.config/ags/assets/forward.svg`} pixelSize={11}/>
                                        </button>
                                        <button onClicked={() => item.loop()} >
                                            <image file={`${HOME_DIR}/.config/ags/assets/loop.svg`} pixelSize={14}/>
                                        </button>
                                    </box>
                                    <With value={createBinding(item, "position")}>
                                        {() => ( <levelbar visible={createBinding(item, "canSeek")} css="min-height: 3px; margin: 8px;" value={calculateProgress(item, createBinding(item, "position").get(), createBinding(item, "length").get())} maxValue={100} hexpand/>)}
                                    </With>
                                </box>
                            )}
                        </For>
                    </box>
                )}
            </With>
        </box>
    )
}
