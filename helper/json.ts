import { readFile, writeFile } from 'ags/file';
import { CACHE_DIR } from './constants';
import GLib from 'gi://GLib?version=2.0';

/**
 * @brief Reads a JSON file and returns the parsed object.
 * @param filePath The path to the JSON file, relative to the AGS cache dir.
 * @param defaultValue The default value to return if the file doesn't exist or is invalid.
 * @returns The parsed JSON object or the default value.
 */
export function readJson<T>(filePath: string, defaultValue: T): T {
    const fullPath = `${CACHE_DIR}/${filePath}`;
    if (!GLib.file_test(fullPath, GLib.FileTest.EXISTS)) {
        writeJson(filePath, defaultValue);
        return defaultValue;
    }

    try {
        const content = readFile(fullPath);
        return JSON.parse(content) as T;
    } catch (error) {
        console.error(`[ags] Failed to parse JSON from ${fullPath}, using default. Error: ${error}`);
        writeJson(filePath, defaultValue);
        return defaultValue;
    }
}

export function writeJson<T>(filePath: string, object: T): void {
    const fullPath = `${CACHE_DIR}/${filePath}`;
    const content = JSON.stringify(object, null, 2);
    writeFile(fullPath, content);
}