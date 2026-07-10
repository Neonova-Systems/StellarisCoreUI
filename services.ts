import { readJson, writeJson } from "./helper/json"
import { WALLPAPER_JSON, SIGNAL_JSON } from "./helper/constants";
import { execAsync } from "ags/process"
import { serviceCallback } from "./service/dashboard-service";
import { handleStateChange, stateMappings } from "./service/global-state-mapping-service";

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
    addService(request, `State-${key}`, [`get ${key}`], (serviceRes) => handleStateChange(stateMappings[key], serviceRes), res);
    addService(request, `Toggle-${key}`, [`toggle ${key}`], (serviceRes) => handleStateChange(stateMappings[key], serviceRes, true), res);
  }
}
