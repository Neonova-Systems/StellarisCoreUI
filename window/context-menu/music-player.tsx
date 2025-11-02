import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { SpawnContextMenu, spawnContextMenu } from "../ContextMenu"
import style from "../../style.scss";
import { DeleteWindowOnOutofBound } from "../../helper";
import { interval } from "ags/time";
import app from "ags/gtk4/app";

const commandsList = [
    { name: "Play", description: "", command: "", keybind: ""},
    { name: "Pause", description: "", command: "", keybind: ""},
    { name: "Next", description: "", command: "", keybind: ""},
    { name: "Previous", description: "", command: "", keybind: ""},
    { name: "Stop", description: "", command: "", keybind: ""},
]
spawnContextMenu(commandsList);

// const hyprland = AstalHyprland.get_default();
// const pointerX = hyprland.cursorPosition.x;
// const pointerY = hyprland.cursorPosition.y;
// const id = `context-menu-${Math.random().toString(36).substring(2, 11)}`;
// print(id);
// app.start({
//     instanceName: id,
//     // instanceName: "context-menu",
//     css: style,
//     main() {
//         SpawnContextMenu(commandsList, id);
//         const poll = interval(200, () => { DeleteWindowOnOutofBound(hyprland.cursorPosition, id, pointerX, pointerY, poll); })
//         // const poll = interval(200, () => { try { DeleteWindowOnOutofBound(hyprland.cursorPosition, "ContextMenu", pointerX, pointerY, poll); } catch (e) { poll.cancel() } })
//     },
// })