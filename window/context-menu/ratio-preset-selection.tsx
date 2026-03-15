import { HOME_DIR } from "../../helper";
import { spawnContextMenu } from "../ContextMenu";

const commandsList = [
    { name: "16:9", description: "Widescreen", command: `bash ${HOME_DIR}/.config/ags/scripts/change-size-focused-client 16:9`, keybind: "1" },
    { name: "16:10", description: "Productivity wide", command: `bash ${HOME_DIR}/.config/ags/scripts/change-size-focused-client 16:10`, keybind: "2" },
    { name: "4:3", description: "Classic", command: `bash ${HOME_DIR}/.config/ags/scripts/change-size-focused-client 4:3`, keybind: "3" },
    { name: "3:2", description: "Balanced", command: `bash ${HOME_DIR}/.config/ags/scripts/change-size-focused-client 3:2`, keybind: "4" },
    { name: "21:9", description: "Ultrawide", command: `bash ${HOME_DIR}/.config/ags/scripts/change-size-focused-client 21:9`, keybind: "5" },
    { name: "1:1", description: "Square", command: `bash ${HOME_DIR}/.config/ags/scripts/change-size-focused-client 1:1`, keybind: "6" },
];
spawnContextMenu(commandsList);