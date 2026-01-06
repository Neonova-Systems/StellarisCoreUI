import app from "ags/gtk4/app"
import { Astal } from "gi://Astal?version=4.0"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { writeFile } from "ags/file"
import { readJson, writeJson } from "./helper/json"
import { WALLPAPER_JSON, SIGNAL_JSON, DASHBOARD_STATE_JSON, HOME_DIR } from "./helper/constants";
import { execAsync } from "ags/process"

const hyprland = AstalHyprland.get_default();
let signal = readJson(SIGNAL_JSON, {
    refreshAppIcon: false,
})

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
    hardwareGraphState: "HardwareGraph",
    filesystemGraphState: "FilesystemGraph",
    desktopIconsVisible: "DesktopIcons",
    notificationVerbosityState: "NotificationVerbosity"
} as const;

export type DashboardState = {
    [K in keyof typeof stateKeys]: boolean;
} & {
    [key: string]: boolean;
}

// Auto-generate defaults (all true)
const defaultDashboardState: DashboardState = Object.keys(stateKeys).reduce((acc, key) => {
    (acc as any)[key] = true;
    return acc;
}, {} as DashboardState);

let dashboardState = readJson<DashboardState>(DASHBOARD_STATE_JSON, defaultDashboardState);

// Auto-generate mappings (inverted: "DataStream" -> "dataStreamVisible")
const stateMappings = Object.entries(stateKeys).reduce((acc, [key, value]) => {
    acc[value] = key as keyof DashboardState;
    return acc;
}, {} as { [key: string]: keyof DashboardState });

export function applyCurrentDashboardState() {
    const visible = dashboardState.visible;
    const dashboard = app.get_window("Dashboard") as Astal.Window | undefined;
    const topLeftCorner = app.get_window("TopLeftCorner") as Astal.Window | undefined;
    const topRightCorner = app.get_window("TopRightCorner") as Astal.Window | undefined;
    const bottomLeftCorner = app.get_window("BottomLeftCorner") as Astal.Window | undefined;
    const bottomRightCorner = app.get_window("BottomRightCorner") as Astal.Window | undefined;

    if (dashboard) { dashboard.visible = visible; }

    if (visible) {
        const marginBottom = hyprland.get_focused_monitor().height / 4;
        const marginLeft = hyprland.get_focused_monitor().width / 4 - 10;

        if (topLeftCorner) {
            topLeftCorner.marginLeft = marginLeft;
            topLeftCorner.marginTop = 10;
        }
        if (topRightCorner) {
            topRightCorner.marginRight = 10;
            topRightCorner.marginTop = 10;
        }
        if (bottomLeftCorner) {
            bottomLeftCorner.marginBottom = marginBottom;
            bottomLeftCorner.marginLeft = marginLeft;
        }
        if (bottomRightCorner) {
            bottomRightCorner.marginRight = 10;
            bottomRightCorner.marginBottom = marginBottom;
        }
        hyprland.get_monitors().forEach((monitor) => {
            const bottom_space = monitor.height / 4;
            const left_space = monitor.width / 4 - 10;
            writeFile(`${HOME_DIR}/.config/hypr/reserved-space.conf`, `monitor=${monitor.name}, addreserved, 10, ${bottom_space}, ${left_space}, 10`);
        });
    } else {
        if (topLeftCorner) { topLeftCorner.marginLeft = topLeftCorner.marginTop = 0; }
        if (bottomLeftCorner) { bottomLeftCorner.marginBottom = bottomLeftCorner.marginLeft = 0; }
        if (topRightCorner) { topRightCorner.marginRight = topRightCorner.marginTop = 0; }
        if (bottomRightCorner) { bottomRightCorner.marginBottom = bottomRightCorner.marginRight = 0; }
        hyprland.get_monitors().forEach((monitor) => { writeFile(`${HOME_DIR}/.config/hypr/reserved-space.conf`, `monitor=${monitor.name}, addreserved, 0, 0, 0, 0`); });
    }
}

function handleStateChange(key: keyof DashboardState, res: (response: any) => void, toggle = false) {
    if (toggle) {
        dashboardState[key] = !dashboardState[key];
        writeJson(DASHBOARD_STATE_JSON, dashboardState);
    }
    return res(String(dashboardState[key]));
}

export function requestHandler(argv: string[], res: (response: any) => void) {
    const request = argv.join(" ");
    if (request === "toggleDashboard" || request === "toggle dashboard") {
        (dashboardState as any).visible = !dashboardState.visible;
        writeJson(DASHBOARD_STATE_JSON, dashboardState);
        applyCurrentDashboardState();
        return res(dashboardState.visible ? "Dashboard Activated" : "Dashboard Deactivated");
    }

    if (request.startsWith("updateWallpaper")) {
        const path = request.substring("updateWallpaper".length).trim();
        if (path) {
            writeJson(WALLPAPER_JSON, { path });
            return res(`Wallpaper path updated to: ${path}`);
        }
    }

    if (request === "getWallpaperPath" || request === "get wallpaper path") {
        const wallpaperObj = readJson(WALLPAPER_JSON, {});
        return res(typeof wallpaperObj === "object" && wallpaperObj !== null && "path" in wallpaperObj ? String(wallpaperObj.path) : "");
    }

    if (request === "refresh desktop") {
        execAsync(`dash -c "swww query | sed 's/.*image: //'"`).then((out) => { // update wallpaper
            execAsync(`ags request "updateWallpaper ${out}"`);
        })
        signal.refreshAppIcon = true;
        writeJson(SIGNAL_JSON, signal);
        return res("Desktop Refreshed");
    }

    if (request === "open wallpaper selector") {
        execAsync(`zsh -ic "cd ~/Pictures/Wallpaper && wallpaper-handler --choose"`).then(() => { execAsync("ags request 'refresh desktop'"); })
    }

    for (const key in stateMappings) {
        if (request === `get${key}State`) {
            return handleStateChange(stateMappings[key], res);
        }
        if (request === `toggle${key}`) {
            return handleStateChange(stateMappings[key], res, true);
        }
    }
}
