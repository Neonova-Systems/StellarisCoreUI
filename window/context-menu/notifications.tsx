import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Toggle", description: "Show or hide detailed notification information", command: "ags request 'toggle NotificationVerbosity'", keybind: ""},
    { name: "Do Not Disturb", description: "Mute or unmute notifications", command: "ags request 'toggle NotificationDND'", keybind: ""}
]
spawnContextMenu(commandsList);