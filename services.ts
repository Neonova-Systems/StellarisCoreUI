import { readJson, writeJson } from "./helper/json"
import { WALLPAPER_JSON, SIGNAL_JSON, GLOBAL_BOOLEAN_STATE_JSON } from "./helper/constants";
import { execAsync } from "ags/process"
import { serviceCallback } from "./service/dashboard-service";

// State management
const stateKeys = {
  visible: "Dashboard",
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
const stateMappings = Object.entries(stateKeys).reduce((acc, [key, value]) => {
  acc[value] = key as keyof GlobalState;
  return acc;
}, {} as { [key: string]: keyof GlobalState });


function handleStateChange(key: keyof GlobalState, res: (response: any) => void, toggle = false) {
  if (toggle) {
    dashboardState[key] = !dashboardState[key];
    writeJson(GLOBAL_BOOLEAN_STATE_JSON, dashboardState);
  }
  return res(String(dashboardState[key]));
}

/**
 * Registers an application service action by matching a CLI `ags request` string 
 * against an array of valid trigger keywords.
 * @param requestArgv - The joined, normalized CLI request string from the user.
 * @param serviceName - The name identifier used for response logging and error tracing.
 * @param trigger - An array of accepted string commands that activate this service.
 * @param callback - The core execution logic to run when a trigger matches. 
 * Receives the standard IPC response channel.
 * @param res - The IPC response callback used to return status messages back to the CLI.
 * @example
 * ```ts 
 * addService( request, "cool-service", ["abc", "ab c"], (actionRes) => { console.log("hello") }, res);
 * ```
 */
function addService(requestArgv: string, serviceName: string, trigger: string[],
  callback: (res: (response: string) => void) => void,
  res: (response: string) => void
): void {
  try {
    if (trigger.includes(requestArgv)) {
      callback(res);
      res(`${serviceName}-${Date.now()}: Done`);
    }
  } catch (error) {
    res(`${serviceName}-${Date.now()}: ${error}`);
  }
}

export function requestHandler(argv: string[], res: (response: any) => void) {
  const request = argv.join(" ").toLowerCase();

  addService(request, "dasboardToggle", ["toggle dashboard", "toggledashboard"], serviceCallback, res);
  addService(request, "wallpaper", ["updateWallpaper", "update wallpaper"], () => {
    const path = request.substring("updateWallpaper".length).trim();
    if (path) {
      writeJson(WALLPAPER_JSON, { path });
      return res(`Wallpaper path updated to: ${path}`);
    }
  }, res)
  addService(request, "wallpaper", ["getWallpaperPath", "get wallpaper path"], () => {
    const wallpaperObj = readJson(WALLPAPER_JSON, {});
    return res(typeof wallpaperObj === "object" && wallpaperObj !== null && "path" in wallpaperObj ? String(wallpaperObj.path) : "");
  }, res)
  addService(request, "wallpaper", ["open wallpaper selector"], () => {
    execAsync(`zsh -ic "cd ~/Pictures/Wallpaper && wallpaper-handler --choose"`).then(() => { execAsync("ags request 'refresh desktop'"); })
  }, res)

  addService(request, "utility", ["refresh desktop"], () => {
    let signal = readJson(SIGNAL_JSON, {
      refreshAppIcon: false,
    })
    execAsync(`dash -c "awww query | sed 's/.*image: //'"`).then((out) => { // update wallpaper
      execAsync(`ags request "updateWallpaper ${out}"`);
    })
    signal.refreshAppIcon = true;
    writeJson(SIGNAL_JSON, signal);
    return res("Desktop Refreshed");
  }, res)

  for (const key in stateMappings) {
    if (request === `get ${key}`) {
      return handleStateChange(stateMappings[key], res);
    }
    if (request === `toggle ${key}`) {
      return handleStateChange(stateMappings[key], res, true);
    }
  }
}
