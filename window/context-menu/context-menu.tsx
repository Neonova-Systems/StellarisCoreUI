import { HOME_DIR } from "../../helper";
import { spawnContextMenu } from "../ContextMenu";

const commandsList = [
    { name: "Open terminal", command: `zsh -ic "spawn-terminal-relative"`, keybind: "enter", description: "Spawns a terminal at the current workspace." },
    { name: "Resize", command: `zsh -ic "resize-current-window"`, keybind: "r", description: "Enter resize submap for the active window." },
    { name: "Move", command: "hyprctl dispatch submap manage-window", description: "Enter move submap for the active window.", keybind: "CTRL + F" },
    { name: "Close", command: "hyprctl kill", keybind: "ctrl + x", description: "Closes the active window." },
    { name: "Toggle floating", command: "hyprctl dispatch togglefloating", keybind: "f", description: "Toggles floating mode for the active window." },
    { name: "Move to the center", command: "hyprctl dispatch centerwindow", keybind: "G", description: "Moves the active window to the center." },
    { name: "Toggle Gaps", command: `zsh -ic 'toggle-gaps'`, description: "Toggles gaps between windows." },
    { name: "Increase Gap", command: `bash ${HOME_DIR}/.config/ags/scripts/set-innergap-ratio +5 && bash ${HOME_DIR}/.config/ags/scripts/set-outergapsize-ratio +5`, description: "Increases the gap size." },
    { name: "Decrease Gap", command: `bash ${HOME_DIR}/.config/ags/scripts/set-innergap-ratio -5 && bash ${HOME_DIR}/.config/ags/scripts/set-outergapsize-ratio -5`, description: "Decreases the gap size." },
];

spawnContextMenu(commandsList);
