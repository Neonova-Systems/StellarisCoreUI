import { GLOBAL_BOOLEAN_STATE_JSON, readJson, writeJson } from "../helper";

const stateKeys = {
  dataStreamVisible: "DataStream",
  systemInfoVisible: "SystemInfo",
  networkInfoVisible: "NetworkInfo",
  filesystemInfoVisible: "FilesystemInfo",
  hardwareInfoVisible: "HardwareInfo",
  batteryInfoVisible: "BatteryInfo",
  notificationVisible: "Notification",
  layerInformationVisible: "LayerInformation",
  ControlCenterVisible: "ControlCenter",
  recentlyUsedVisible: "RecentlyUsed",
  exploitDeckVisible: "ExploitDeck",
  hardwareGraphState: "HardwareGraph",
  filesystemGraphState: "FilesystemGraph",
  desktopIconsVisible: "DesktopIcons",
  notificationVerbosityState: "NotificationVerbosity",
  notificationDNDState: "NotificationDND",
  audioControlVerbosityState: "AudioControlVerbosity",
  controlKeyState: "ControlKey"
} as const;

export type GlobalState = Record<keyof typeof stateKeys, boolean>;

// Auto-generate defaults (all true)
const defaultDashboardState = Object.keys(stateKeys).reduce((acc, key) => {
  acc[key as keyof GlobalState] = true;
  return acc;
}, {} as GlobalState);

let state = readJson<GlobalState>(GLOBAL_BOOLEAN_STATE_JSON, defaultDashboardState);

// Auto-generate mappings (inverted: "DataStream" -> "dataStreamVisible")
export const stateMappings = Object.entries(stateKeys).reduce((acc, [key, value]) => {
  acc[value] = key as keyof GlobalState;
  return acc;
}, {} as Record<string, keyof GlobalState>);

export function handleStateChange(key: keyof GlobalState, res: (response: string) => void, toggle = false): void {
  if (toggle) {
    state[key] = !state[key];
    writeJson(GLOBAL_BOOLEAN_STATE_JSON, state);
  }
  res(String(state[key]));
}
