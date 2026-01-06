import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Toggle", description: "Show or hide detailed notification information", command: "ags request 'toggleNotificationVerbosity'", keybind: ""},
]
spawnContextMenu(commandsList);