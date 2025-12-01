import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Shutdown", description: "Power off the system", command: "/usr/bin/poweroff", keybind: ""},
    { name: "Restart", description: "Reboot the system", command: "/usr/bin/poweroff --reboot", keybind: ""},
    { name: "Logout", description: "Exit the current session", command: "/usr/bin/hyprctl dispatch exit", keybind: ""},
    { name: "Suspend", description: "Suspend to RAM", command: "/usr/bin/systemctl suspend", keybind: ""},
    { name: "Lockscreen", description: "Lock the screen", command: `zsh -ic 'lock-screen && sleep 1'`, keybind: "", dontAsync: true},
]
spawnContextMenu(commandsList);