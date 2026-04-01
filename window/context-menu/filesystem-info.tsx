import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Toggle", description: "Toggle filesystem monitoring graphs visibility", command: "ags request 'toggle FilesystemGraph'", keybind: ""},
]
spawnContextMenu(commandsList);