import AstalNotifd from "gi://AstalNotifd";
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
  controlKeyState: "ControlKey",
  musicPlayerVisible: "MusicPlayer"
} as const;

export type GlobalState = Record<keyof typeof stateKeys, boolean>;

// Auto-generate defaults (all true)
const defaultDashboardState = Object.keys(stateKeys).reduce((acc, key) => {
  acc[key as keyof GlobalState] = true;
  return acc;
}, {} as GlobalState);

// The music player panel starts collapsed, unlike the dashboard cards.
defaultDashboardState.musicPlayerVisible = false;

// Merge over the defaults so a cache written before a key existed still reads
// as its default instead of undefined.
const state: GlobalState = {
  ...defaultDashboardState,
  ...readJson<Partial<GlobalState>>(GLOBAL_BOOLEAN_STATE_JSON, {}),
};

try {
  const notifd = AstalNotifd.get_default();
  if (typeof state.notificationDNDState === "boolean") {
    notifd.dontDisturb = state.notificationDNDState;
  }
} catch (e) {
  console.error("Failed to initialize AstalNotifd dontDisturb state:", e);
}

// Auto-generate mappings (inverted: "DataStream" -> "dataStreamVisible")
export const stateMappings = Object.entries(stateKeys).reduce((acc, [key, value]) => {
  acc[value] = key as keyof GlobalState;
  return acc;
}, {} as Record<string, keyof GlobalState>);

export function handleStateChange(key: keyof GlobalState, res: (response: string) => void, toggle = false): void {
  if (toggle) {
    state[key] = !state[key];
    writeJson(GLOBAL_BOOLEAN_STATE_JSON, state);
    if (key === "notificationDNDState") {
      try {
        AstalNotifd.get_default().dontDisturb = state[key];
      } catch (e) {
        console.error("Failed to sync AstalNotifd dontDisturb state:", e);
      }
    }
  }
  res(String(state[key]));
}
