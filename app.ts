import app from "ags/gtk4/app"
import style from "./style.scss"
import Dashboard from "./widget/Dashboard"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import GLib from "gi://GLib?version=2.0"
import { BottomRightCorner, TopRightCorner, BottomLeftCorner, TopLeftCorner } from "./widget/Corners"
import { writeFile } from "ags/file"
import { readJson, writeJson } from "./helper/json"
import { Astal } from "gi://Astal?version=4.0"

const hyprland = AstalHyprland.get_default();
const HOME_DIR = GLib.get_home_dir();

// State management
type DashboardState = {
    visible: boolean;
    dataStreamVisible: boolean;
    systemInfoVisible: boolean;
    networkInfoVisible: boolean;
    filesystemInfoVisible: boolean;
    hardwareInfoVisible: boolean;
    batteryInfoVisible: boolean;
}
const STATE_FILE = "dashboard-state.json";
let dashboardState = readJson<DashboardState>(STATE_FILE, { visible: true, dataStreamVisible: true, systemInfoVisible: true, networkInfoVisible: true, filesystemInfoVisible: true, hardwareInfoVisible: true, batteryInfoVisible: true });

function applyCurrentDashboardState() {
    const visible = dashboardState.visible;
    const dashboard = app.get_window("Dashboard") as Astal.Window | undefined;
    const topLeftCorner = app.get_window("TopLeftCorner") as Astal.Window | undefined;
    const topRightCorner = app.get_window("TopRightCorner") as Astal.Window | undefined;
    const bottomLeftCorner = app.get_window("BottomLeftCorner") as Astal.Window | undefined;
    const bottomRightCorner = app.get_window("BottomRightCorner") as Astal.Window | undefined;

    if (dashboard) {
        dashboard.visible = visible;
    }

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

app.start({
    css: style,
    main() {
        app.get_monitors().map(Dashboard)
        app.get_monitors().map(TopRightCorner)
        app.get_monitors().map(BottomRightCorner)
        app.get_monitors().map(TopLeftCorner)
        app.get_monitors().map(BottomLeftCorner)

        // Apply initial state. A timeout is good practice to ensure windows are ready.
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
            applyCurrentDashboardState();
            return GLib.SOURCE_REMOVE;
        });
    },
    requestHandler(argv: string[], res: (response: any) => void) {
        const request = argv.join(" ");
        if (request == "toggleDashboard" || request == "toggle dashboard") {
            dashboardState.visible = !dashboardState.visible;
            writeJson(STATE_FILE, dashboardState);
            applyCurrentDashboardState();
            return res(dashboardState.visible ? "Dashboard Activated" : "Dashboard Deactivated");
        }
        if (request === "getDataStreamState") {
            return res(dashboardState.dataStreamVisible);
        }
        if (request === "toggleDataStream") {
            dashboardState.dataStreamVisible = !dashboardState.dataStreamVisible;
            writeJson(STATE_FILE, dashboardState);
            return res(String(dashboardState.dataStreamVisible));
        }
        if (request === "getSystemInfoState") {
            return res(String(dashboardState.systemInfoVisible));
        }
        if (request === "toggleSystemInfo") {
            dashboardState.systemInfoVisible = !dashboardState.systemInfoVisible;
            writeJson(STATE_FILE, dashboardState);
            return res(String(dashboardState.systemInfoVisible));
        }
        if (request === "getNetworkInfoState") {
            return res(String(dashboardState.networkInfoVisible));
        }
        if (request === "toggleNetworkInfo") {
            dashboardState.networkInfoVisible = !dashboardState.networkInfoVisible;
            writeJson(STATE_FILE, dashboardState);
            return res(String(dashboardState.networkInfoVisible));
        }
        if (request === "getFilesystemInfoState") {
            return res(String(dashboardState.filesystemInfoVisible));
        }
        if (request === "toggleFilesystemInfo") {
            dashboardState.filesystemInfoVisible = !dashboardState.filesystemInfoVisible;
            writeJson(STATE_FILE, dashboardState);
            return res(String(dashboardState.filesystemInfoVisible));
        }
        if (request === "getHardwareInfoState") {
            return res(String(dashboardState.hardwareInfoVisible));
        }
        if (request === "toggleHardwareInfo") {
            dashboardState.hardwareInfoVisible = !dashboardState.hardwareInfoVisible;
            writeJson(STATE_FILE, dashboardState);
            return res(String(dashboardState.hardwareInfoVisible));
        }
        if (request === "getBatteryInfoState") {
            return res(String(dashboardState.batteryInfoVisible));
        }
        if (request === "toggleBatteryInfo") {
            dashboardState.batteryInfoVisible = !dashboardState.batteryInfoVisible;
            writeJson(STATE_FILE, dashboardState);
            return res(String(dashboardState.batteryInfoVisible));
        }
    },
})
