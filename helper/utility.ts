import { execAsync } from "ags/process";
import { timeout} from "ags/time";
import { HOME_DIR } from "./constants";
import { Gdk } from "ags/gtk4";
import Gio from "gi://Gio?version=2.0";
import NM from "gi://NM";
import GLib from "gi://GLib?version=2.0";
import giCairo from "cairo";

/**
 * Enum for available audio files
 */
export enum AudioFile {
  Panel = "panels.wav",
  Error = "error.wav",
  Granted = "granted.wav",
  Notification = "notification.wav",
  Enter = "enter.wav",
  Key = "key.wav",
  Hover = "hover-panel.wav",
}

const AUDIO_DIR = `${HOME_DIR}/.config/ags/assets/audio`;

/**
 * Audio backends in order of preference. `paplay` goes through PipeWire and
 * exits when playback finishes; `aplay` is the bare ALSA fallback, but it
 * ignores SIGTERM and can stay blocked on the device, so it is only tried when
 * `paplay` is missing or fails immediately.
 */
const AUDIO_PLAYERS = ["paplay", "aplay"] as const;

/**
 * Minimum gap between two requests for the same sound. Several widgets mount
 * together and each asks for the panel sound; without this the requests stack
 * into overlapping playback.
 */
const SOUND_COALESCE_MS = 250;

/**
 * How long one backend may run before it counts as failed. `timeout -k` also
 * sends SIGKILL, because a blocked aplay ignores SIGTERM.
 */
const PLAYBACK_TIMEOUT_SECONDS = 3;

let lastSoundRequest: { file: string; at: number } | null = null;

async function playWithFallback(filePath: string): Promise<void> {
  for (const [index, player] of AUDIO_PLAYERS.entries()) {
    // `timeout -k 1 3` sends SIGTERM at 3s and SIGKILL one second later, so a
    // blocked player cannot outlive the request or block the next backend.
    try {
      await execAsync([
        "timeout",
        "-k",
        "1",
        `${PLAYBACK_TIMEOUT_SECONDS}`,
        player,
        filePath,
      ]);
      return;
    } catch (error) {
      if (index === AUDIO_PLAYERS.length - 1) {
        console.error(`Error playing sound ${filePath}:`, error);
      }
    }
  }
}

/**
 * Plays an audio file from `assets/audio` after an optional delay.
 *
 * Tries `paplay`, then `aplay`. A request for the same file within
 * `SOUND_COALESCE_MS` of the previous one is dropped, so widgets that mount
 * together do not layer the same sound.
 *
 * @param audioFileName - File name or AudioFile member in `assets/audio/`.
 * @param delayMs - Delay in milliseconds before playing (default: 100).
 *
 * @example
 * playSound(AudioFile.Panel, 500);
 * playSound(AudioFile.Notification); // Uses default 100ms delay
 */
export function playSound(
  audioFileName: AudioFile | string,
  delayMs: number = 100,
): void {
  const filePath = `${AUDIO_DIR}/${audioFileName}`;
  const now = Date.now();

  if (
    lastSoundRequest &&
    lastSoundRequest.file === filePath &&
    now - lastSoundRequest.at < SOUND_COALESCE_MS
  ) {
    return;
  }

  lastSoundRequest = { file: filePath, at: now };
  timeout(delayMs, () => void playWithFallback(filePath));
}

/**
 * Formats a number of bytes into a human-readable string with appropriate units.
 *
 * @param {number} bytes - The number of bytes to format.
 * @param {number} [decimals=2] - The number of decimal places to include in the output.
 * @returns {string} A human-readable string representing the byte size (e.g., "1.23 MB").
 * @example
 * // returns "1.00 KB"
 * formatBytes(1024);
 *
 * @example
 * // returns "1.177 MB"
 * formatBytes(1234567, 3);
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Generates a random string of a specified length.
 * The string is composed of uppercase letters (A-Z), lowercase letters (a-z),
 * and numbers (0-9).
 *
 * @param length - The desired length of the random string.
 * @returns The generated random string.
 * @example
 * // returns a 10-character random string, e.g., "aB3x7zP9kL"
 * createRandomString(10);
 */
export function createRandomString(length: number): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function copyToClipboard(text: string) {
  const clipboard =
    Gdk.Display.get_default()?.get_clipboard() as Gdk.Clipboard | null;
  if (clipboard && text) {
    clipboard.set_content(Gdk.ContentProvider.new_for_value(text));
    playSound(AudioFile.Granted);
  }
}

/**
 * Formats a Unix timestamp into a human-readable time string.
 *
 * @param time The Unix timestamp (seconds since epoch) to format.
 * @param format The format string to use, based on GLib.DateTime format specifiers. Defaults to "%H:%M".
 * @returns The formatted time string.
 * @example
 * // Get time in default HH:MM format
 * formatTime(Date.now() / 1000); // e.g., "14:30"
 *
 * // Get time in a custom format
 * formatTime(Date.now() / 1000, "%Y-%m-%d %I:%M %p"); // e.g., "2023-10-27 02:30 PM"
 */
export function formatTime(time: number, format = "%H:%M") {
  return GLib.DateTime.new_from_unix_local(time).format(format)!;
}

/**
 * Converts a hex color string to Cairo RGBA values
 * @param hex - Hex color string (e.g., "#1a39ed" or "1a39ed")
 * @param alpha - Optional alpha value between 0 and 1 (default: 1.0)
 * @returns Object with r, g, b, a values normalized to 0-1 range
 * @example
 * const { r, g, b, a } = hexToRGBA("#1a39ed", 0.5);
 * cr.setSourceRGBA(r, g, b, a);
 */
export function hexToRGBA(
  hex: string,
  alpha: number = 1.0,
): { r: number; g: number; b: number; a: number } {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  return { r, g, b, a: Math.max(0, Math.min(1, alpha)) };
}

/**
 * Converts hex color and applies it directly to a Cairo context
 * @param cr - Cairo context
 * @param hex - Hex color string
 * @param alpha - Optional alpha value (default: 1.0)
 * @example
 * setSourceRGBAFromHex(cr, "#1a39ed", 0.17);
 */
export function setSourceRGBAFromHex(
  cr: giCairo.Context,
  hex: string,
  alpha: number = 1.0,
): void {
  const { r, g, b, a } = hexToRGBA(hex, alpha);
  cr.setSourceRGBA(r, g, b, a);
}

/**
 * Updates a rolling window of data points by adding a new value and
 * truncating the array from the beginning if it exceeds the maximum size.
 *
 * @param prev The existing array of numbers representing the current window.
 * @param newValue The new number to add to the end of the window.
 * @param maxPoints The maximum number of points to keep in the window. Defaults to 20.
 * @returns A new array representing the updated rolling window.
 * @example
 * // When the window is not full
 * const window1 = [1, 2, 3];
 * updateRollingWindow(window1, 4, 5); // Returns [1, 2, 3, 4]
 *
 * // When the window is full and needs truncation
 * const window2 = [1, 2, 3, 4, 5];
 * updateRollingWindow(window2, 6, 5); // Returns [2, 3, 4, 5, 6]
 */
export function updateRollingWindow(
  prev: number[],
  newValue: number,
  maxPoints: number = 20,
): number[] {
  const newPoints = [...prev, newValue];
  return newPoints.length > maxPoints ? newPoints.slice(-maxPoints) : newPoints;
}

export function getLocalIP(): string {
  try {
    // Create a socket connection to a public IP (doesn't send data)
    const client = new Gio.SocketClient();
    const conn = client.connect(
      new Gio.InetSocketAddress({
        address: Gio.InetAddress.new_from_string("1.1.1.1"),
        port: 80,
      }),
      null,
    );

    // Retrieve the local interface address used for the route
    const localAddr = conn.get_local_address() as Gio.InetSocketAddress;
    const ip = localAddr.get_address().to_string();
    conn.close(null);

    return ip;
  } catch (e) {
    return "Disconnected";
  }
}

export function getNMGatewayIP(): string {
  try {
    const client = NM.Client.new(null);
    const primaryConn = client.get_primary_connection();
    if (!primaryConn) return "Disconnected";

    const ip4Config = primaryConn.get_ip4_config();
    if (ip4Config) {
      const gateway = ip4Config.get_gateway();
      if (gateway) return gateway;
    }
  } catch (e) {
    console.error("NM Error:", e);
  }
  return "Unknown";
}
