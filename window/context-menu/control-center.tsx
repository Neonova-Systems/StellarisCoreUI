import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Toggle", description: "Show or hide the control entries section.", command: "ags request 'toggle ControlKey'", keybind: ""},
]
spawnContextMenu(commandsList);