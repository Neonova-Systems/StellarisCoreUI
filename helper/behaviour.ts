import { execAsync } from "ags/process";
import { interval, timeout, Timer } from "ags/time";
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
 * Initializes a boolean panel state by querying `ags request "get${stateName}State"`
 * after a delay.
 *
 * @param stateName Name used to build the `get${stateName}State` request.
 * @param setterFunction Setter that receives the resolved boolean state.
 * @param delayMs Delay before the first request (defaults to 500ms).
 */
export function initToggleState(stateName: string, setterFunction: (value: boolean) => void, delayMs = 500): void {
    timeout(delayMs, () => {
        execAsync(`ags request "get${stateName}State"`)
            .then(out => setterFunction(out === "true"))
            .catch(err => console.error(`Failed to initialize ${stateName} state:`, err));
    });
}

/**
 * Polls a boolean AGS state and passes updates to a callback.
 *
 * @param stateName Name used to build the `get${stateName}State` request.
 * @param intervalMs Polling interval in milliseconds.
 * @param onChange Callback invoked with parsed boolean value.
 * @returns The created AGS timer so callers can cancel if needed.
 */
export function watchRequestBoolean(stateName: string, intervalMs: number, onChange: (value: boolean) => void): Timer {
    return interval(intervalMs, () => {
        execAsync(`ags request "get${stateName}State"`)
            .then(out => onChange(out === "true"))
            .catch(err => console.error(`Failed to poll ${stateName} state:`, err));
    });
}

/**
 * Opens a context-menu AGS window.
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

/**
 * Returns the next asset path in a variant list based on the current path.
 *
 * If `currentPath` is not found in `variants`, it returns the first variant.
 *
 * @param currentPath Current asset path.
 * @param variants Ordered list of asset variants.
 * @returns The next variant path.
 */
export function cycleAssetVariant(currentPath: string, variants: string[]): string {
    if (variants.length === 0) return currentPath;

    const currentIndex = variants.indexOf(currentPath);
    if (currentIndex === -1) return variants[0];

    return variants[(currentIndex + 1) % variants.length];
}