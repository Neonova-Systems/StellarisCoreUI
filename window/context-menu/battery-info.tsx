import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Performance", description: "Maximum performance", command: "powerprofilesctl set performance", keybind: ""},
    { name: "Balanced", description: "Balanced power and performance", command: "powerprofilesctl set balanced", keybind: ""},
    { name: "Power Saver", description: "Maximize battery life", command: "powerprofilesctl set power-saver", keybind: ""},
]
spawnContextMenu(commandsList);