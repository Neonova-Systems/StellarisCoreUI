import { execAsync } from "ags/process";
import { timeout, Timer } from "ags/time";
import { HOME_DIR } from "./constants";
import { Gdk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";

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

export function playEnterSound(timeoutSeconds: number = 100) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/enter.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}
export function playKeySound(timeoutSeconds: number = 100) {
    timeout(timeoutSeconds, () => { execAsync(['aplay', `${HOME_DIR}/.config/ags/assets/audio/key.wav`]).catch(err => console.error(`Error playing sound: ${err}`)) })
}

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

export function copyToClipboard(text: string) {
    const clipboard = (Gdk.Display.get_default()?.get_clipboard() as Gdk.Clipboard | null);
    if (clipboard && text) {
        clipboard.set_content(Gdk.ContentProvider.new_for_value(text));
        playGrantedSound();
    }
}

/**
 * Destroys the specified window and quits the app if the cursor moves outside the defined bounds.
 * 
 * @param currentCursorPos - The current cursor position (AstalHyprland.Position).
 * @param windowName - The name of the window to check bounds for.
 * @param anchorPointerX - The X coordinate of the anchor point.
 * @param anchorPointerY - The Y coordinate of the anchor point.
 * @param poll - The GLib.Source polling object to remove.
 * @param offset - Optional offset for the bounds (default: 15).
 * 
 * Side effects: May destroy the "ContextMenu" window, remove the poll source, and quit the app.
 */
export function DeleteWindowOnOutofBound(currentCursorPos: AstalHyprland.Position, windowName: string, anchorPointerX: number, anchorPointerY: number, poll: Timer, offset: number = 15) {
    const windowWidth = app.get_window?.(windowName)?.get_width() || 500;
    const windowHeight = app.get_window?.(windowName)?.get_height() || 0;
    if (!currentCursorPos) return;
    if ( currentCursorPos.x < anchorPointerX - offset ||
        currentCursorPos.x > anchorPointerX + windowWidth + offset ||
        currentCursorPos.y < anchorPointerY - offset ||
        currentCursorPos.y > anchorPointerY + windowHeight + offset) {
        const w = app.get_window?.("ContextMenu");
        if (w) { w.destroy() }
        poll.cancel();
        app.quit();
    }
}