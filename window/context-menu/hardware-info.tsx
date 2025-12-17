import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Toggle", description: "Toggle hardware monitoring graphs visibility", command: "ags request 'toggleHardwareGraph'", keybind: ""},
]
spawnContextMenu(commandsList);