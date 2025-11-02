import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Play", description: "Resume playback of the current track.", command: "/usr/bin/playerctl play", keybind: "p"},
    { name: "Pause", description: "Pause the currently playing track.", command: "/usr/bin/playerctl pause", keybind: ""},
    { name: "Next", description: "Skip to the next track in the playlist.", command: "/usr/bin/playerctl next", keybind: "n"},
    { name: "Previous", description: "Go back to the previous track.", command: "/usr/bin/playerctl previous", keybind: "b"},
    { name: "Stop", description: "Stop playback completely.", command: "/usr/bin/playerctl stop", keybind: "s"},
    { name: "Toggle", description: "Toggle between play and pause states.", command: "/usr/bin/playerctl play-pause", keybind: "space"},
]
spawnContextMenu(commandsList);