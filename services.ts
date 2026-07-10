import { readJson, writeJson } from "./helper/json"
import { WALLPAPER_JSON, SIGNAL_JSON } from "./helper/constants";
import { execAsync } from "ags/process"
import { serviceCallback } from "./service/dashboard-service";
import { handleStateChange, stateMappings } from "./service/global-state-mapping-service";
import { callbackGetWallpaper } from "./modules/wallpaper";

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
  const request = argv.join(" ");

  addService(request, "dasboardToggle", ["toggle dashboard", "toggledashboard"], serviceCallback, res);
  if (request.startsWith("updatewallpaper")) {
    const path = request.substring("updatewallpaper".length).trim();
    if (path) {
      writeJson(WALLPAPER_JSON, { path });
      return res(`Wallpaper path updated to: ${path}`);
    }
  }
  addService(request, "wallpaper", ["getwallpaperpath", "get wallpaper path"], callbackGetWallpaper, res)
  addService(request, "wallpaper", ["open wallpaper selector"], () => {
    execAsync(`zsh -ic "cd ~/Pictures/Wallpaper && wallpaper-handler --choose"`)
      .then(() => execAsync("ags request 'refresh desktop'"))
      .catch((err) => console.error("Selector error:", err));
    res("Wallpaper selector opened");
  }, res)

  addService(request, "utility", ["refresh desktop"], () => {
    interface SignalConfig {
      refreshAppIcon: boolean;
      [key: string]: boolean;
    }
    const fallbackSignal: SignalConfig = { refreshAppIcon: false };
    const signal = readJson<SignalConfig>(SIGNAL_JSON, fallbackSignal);

    execAsync(`dash -c "awww query | sed 's/.*image: //'"`)
      .then((out) => {
        const cleanPath = out.trim();
        return execAsync(`ags request "updatewallpaper ${cleanPath}"`);
      })
      .catch((err) => console.error("Awww query failed:", err));

    signal.refreshAppIcon = true;
    writeJson<SignalConfig>(SIGNAL_JSON, signal);
    res("Desktop Refreshed");
  }, res)

  for (const key in stateMappings) {
    addService(request, `State-${key}`, [`get ${key}`], (serviceRes) => handleStateChange(stateMappings[key], serviceRes), res);
    addService(request, `Toggle-${key}`, [`toggle ${key}`], (serviceRes) => handleStateChange(stateMappings[key], serviceRes, true), res);
  }
}
