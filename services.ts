import app from "ags/gtk4/app"
import { Astal } from "gi://Astal?version=4.0"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { writeFile } from "ags/file"
import { readJson, writeJson } from "./helper/json"
import { WALLPAPER_JSON, DASHBOARD_STATE_JSON, HOME_DIR } from "./helper/constants";

const hyprland = AstalHyprland.get_default();

// State management
export type DashboardState = {
    [key: string]: boolean;
    visible: boolean;
    dataStreamVisible: boolean;
    systemInfoVisible: boolean;
    networkInfoVisible: boolean;
    filesystemInfoVisible: boolean;
    hardwareInfoVisible: boolean;
    batteryInfoVisible: boolean;
    notificationVisible: boolean;
    layerInformationVisible: boolean;
    ControlCenterVisible: boolean;
    hardwareGraphState: boolean;
    filesystemGraphState: boolean;
}

let dashboardState = readJson<DashboardState>(DASHBOARD_STATE_JSON, { 
    visible: true, 
    dataStreamVisible: true, 
    systemInfoVisible: true, 
    networkInfoVisible: true,
    filesystemInfoVisible: true,
    hardwareInfoVisible: true,
    batteryInfoVisible: true,
    notificationVisible: false,
    layerInformationVisible: false,
    ControlCenterVisible: true,
    hardwareGraphState: true,
    filesystemGraphState: true,
});

const stateMappings: { [key: string]: keyof DashboardState } = {
    "DataStream": "dataStreamVisible",
    "SystemInfo": "systemInfoVisible",
    "NetworkInfo": "networkInfoVisible",
    "FilesystemInfo": "filesystemInfoVisible",
    "HardwareInfo": "hardwareInfoVisible",
    "BatteryInfo": "batteryInfoVisible",
    "Notification": "notificationVisible",
    "LayerInformation": "layerInformationVisible",
    "ControlCenter": "ControlCenterVisible",
    "HardwareGraph": "hardwareGraphState",
    "FilesystemGraph": "filesystemGraphState"
};

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
        dashboardState.visible = !dashboardState.visible;
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

    for (const key in stateMappings) {
        if (request === `get${key}State`) {
            return handleStateChange(stateMappings[key], res);
        }
        if (request === `toggle${key}`) {
            return handleStateChange(stateMappings[key], res, true);
        }
    }
}
