import { execAsync } from "ags/process";
import { playPanelSound } from "./utility";

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
 */
export function panelClicked(stateName: string, setterFunction: (value: boolean) => void): void {
    execAsync(`ags request "toggle${stateName}"`).then(out => {
        const isVisible = out === 'true';
        setterFunction(isVisible);
        if (isVisible) {
            playPanelSound(500);
        }
    });
}