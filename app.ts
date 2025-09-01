import app from "ags/gtk4/app"
import style from "./style.scss"
import Dashboard from "./widget/Dashboard"
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import GLib from "gi://GLib?version=2.0";
import { BottomRightCorner, TopRightCorner, BottomLeftCorner, TopLeftCorner } from "./widget/Corners"
import { writeFile } from "ags/file";

const hyprland = AstalHyprland.get_default();
const HOME_DIR = GLib.get_home_dir();
let dashboardState = true;
app.start({
    css: style,
    // instanceName: "StellarisCore",
    main() {
        app.get_monitors().map(Dashboard)
        app.get_monitors().map(TopRightCorner)
        app.get_monitors().map(BottomRightCorner)
        app.get_monitors().map(TopLeftCorner)
        app.get_monitors().map(BottomLeftCorner)
    },
    requestHandler(request: string, res: (response: any) => void) {
        const dashboard = app.get_window("Dashboard")
        const topLeftCorner = app.get_window("TopLeftCorner")
        const topRightCorner = app.get_window("TopRightCorner")
        const bottomLeftCorner = app.get_window("BottomLeftCorner")
        const bottomRightCorner = app.get_window("BottomRightCorner")

        const marginBottom = hyprland.get_focused_monitor().height / 4
        const marginLeft = hyprland.get_focused_monitor().width / 4 - 10

        if (request == "toggleDashboard" || request == "toggle dashboard") {
            if (dashboard !== null) { 
                dashboard.visible = !dashboard?.visible;
                dashboardState = !dashboardState;
            }
            if (dashboardState == true) {
                if (topLeftCorner !== null){
                    topLeftCorner.marginLeft = marginLeft;
                    topLeftCorner.marginTop = 10;
                }
                if (topRightCorner !== null){
                    topRightCorner.marginRight = 10;
                    topRightCorner.marginTop = 10;
                }
                if (bottomLeftCorner !== null){
                    bottomLeftCorner.marginBottom = marginBottom;
                    bottomLeftCorner.marginLeft = marginLeft;
                }
                if (bottomRightCorner !== null){
                    bottomRightCorner.marginRight = 10;
                    bottomRightCorner.marginBottom = marginBottom;
                }
                hyprland.get_monitors().forEach((monitor) => {
                    const bottom_space = monitor.height / 4
                    const left_space = monitor.width / 4 - 10
                    writeFile(`${HOME_DIR}/.config/hypr/reserved-space.conf`, `monitor=${monitor.name}, addreserved, 10, ${bottom_space}, ${left_space}, 10`);
                })
                return res("Dashboard Activated")
            } else {
                if (topLeftCorner !== null) topLeftCorner.marginLeft = topLeftCorner.marginTop = 0;
                if (bottomLeftCorner !== null) bottomLeftCorner.marginBottom = bottomLeftCorner.marginLeft = 0
                if (topRightCorner !== null) topRightCorner.marginRight = topRightCorner.marginTop = 0
                if (bottomRightCorner !== null) bottomRightCorner.marginBottom = bottomRightCorner.marginRight = 0
                hyprland.get_monitors().forEach((monitor) => { writeFile(`${HOME_DIR}/.config/hypr/reserved-space.conf`, `monitor=${monitor.name}, addreserved, 0, 0, 0, 0`); })
                return res("Dashboard Deactivated")
            }
        }       
    },
})

