import { execAsync } from "ags/process";
import { timeout } from "ags/time";
import { HOME_DIR } from "./constants";

export function playPanelSound(timeoutSeconds: number = 500) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/panels.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}

export function playAlertSound(timeoutSeconds: number = 500) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/error.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}

export function playGrantedSound(timeoutSeconds: number = 100) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/granted.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}

export function playNotificationsSound(timeoutSeconds: number = 100) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/notification.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}

export function playEnterSound(timeoutSeconds: number = 100)

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function createRandomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}