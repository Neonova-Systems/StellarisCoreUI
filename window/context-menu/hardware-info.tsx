import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Toggle", description: "Toggle hardware monitoring graphs visibility", command: "ags request 'toggle HardwareGraph'", keybind: ""},
]
spawnContextMenu(commandsList);