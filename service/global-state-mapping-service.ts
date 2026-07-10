import { GLOBAL_BOOLEAN_STATE_JSON, readJson, writeJson } from "../helper";

// State management
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

export type GlobalState = {
  [K in keyof typeof stateKeys]: boolean;
} & {
  [key: string]: boolean;
}

// Auto-generate defaults (all true)
const defaultDashboardState: GlobalState = Object.keys(stateKeys).reduce((acc, key) => {
  (acc as any)[key] = true;
  return acc;
}, {} as GlobalState);

let dashboardState = readJson<GlobalState>(GLOBAL_BOOLEAN_STATE_JSON, defaultDashboardState);

// Auto-generate mappings (inverted: "DataStream" -> "dataStreamVisible")
export const stateMappings = Object.entries(stateKeys).reduce((acc, [key, value]) => {
  acc[value] = key as keyof GlobalState;
  return acc;
}, {} as { [key: string]: keyof GlobalState });

export function handleStateChange(key: keyof GlobalState, res: (response: any) => void, toggle = false) {
  if (toggle) {
    dashboardState[key] = !dashboardState[key];
    writeJson(GLOBAL_BOOLEAN_STATE_JSON, dashboardState);
  }
  return res(String(dashboardState[key]));
}
