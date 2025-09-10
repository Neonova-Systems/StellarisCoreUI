import { execAsync } from "ags/process";
import { timeout } from "ags/time";
import GLib from "gi://GLib?version=2.0";

const HOME_DIR = GLib.get_home_dir();
export function playPanelSound(timeoutSeconds: number = 500) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/panels.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}

export function playAlertSound(timeoutSeconds: number = 500) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/error.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}
