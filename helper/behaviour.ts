import { execAsync } from "ags/process";
import { timeout } from "ags/time";
import { HOME_DIR } from "./constants";
import { AudioFile, playSound } from "./utility";

/**
 * Handles the logic for a panel click event. It asynchronously toggles a
 * state in 'ags', updates the local state via a provided setter function,
 * and plays a sound when the panel becomes visible.
 *
 * @param stateName - The unique name of the state to be toggled in 'ags'.
 * This is used to construct the command `ags request "toggle${stateName}"`.
 * @param setterFunction - A callback function, typically a state setter,
 * that will be called with the new visibility status (`true` for visible,
 * `false` for hidden) received from the 'ags' command.
 * 
 * @example
 * // In a component with state
 * const [isVisible, setIsVisible] = createState(false);
 * 
 * // Use in CreatePanel onClicked handler
 * <CreatePanel name="SYSTEM" onClicked={() => panelClicked("SystemInfo", setIsVisible)}>
 *   ...
 * </CreatePanel>
 */
export function panelClicked(stateName: string, setterFunction: (value: boolean) => void): void {
    execAsync(`ags request "toggle${stateName}"`)
        .then(out => {
            const isVisible = out === 'true';
            setterFunction(isVisible);
            if (isVisible) {
                playSound(AudioFile.Panel, 500);
            }
        })
        .catch(err => {
            console.error(`Failed to toggle ${stateName}:`, err);
        });
}

/**
 * Opens a context-menu AGS window and plays a feedback sound.
 *
 * @param menuFileName Context menu filename in `window/context-menu`.
 * @param sound Audio feedback to play (defaults to granted sound).
 * @param delayMs Optional delay before launching the menu.
 */
export function openContextMenu(menuFileName: string, sound: AudioFile | string = AudioFile.Granted, delayMs = 0): void {
    const command = `ags run ${HOME_DIR}/.config/ags/window/context-menu/${menuFileName} --gtk 4`;
    const runMenu = () => execAsync(command).catch((e) => print(e));

    if (delayMs > 0) {
        timeout(delayMs, runMenu);
    } else {
        runMenu();
    }

    playSound(sound);
}