import app from "ags/gtk4/app"
import style from "./style.scss"
import Dashboard from "./widget/Dashboard"
import { BottomRightCorner, TopRightCorner, BottomLeftCorner, TopLeftCorner } from "./widget/Corners"
import { requestHandler } from "./services"
import { applyCurrentDashboardState } from "./service/dashboard-service"
import Adw from "gi://Adw?version=1";
import AstalHyprland from "gi://AstalHyprland?version=0.1"

app.start({
  css: style,
  main() {
    // execAsync(`bash -lc 'nohup python ${HOME_DIR}/.config/ags/scripts/recent-apps-listener.py >/dev/null 2>&1 &'`)
    app.get_monitors().map(Dashboard)
    app.get_monitors().map(TopRightCorner)
    app.get_monitors().map(BottomRightCorner)
    app.get_monitors().map(TopLeftCorner)
    app.get_monitors().map(BottomLeftCorner)

    Adw.StyleManager.get_default().set_color_scheme(Adw.ColorScheme.PREFER_DARK);
    applyCurrentDashboardState();

    const hyprland = AstalHyprland.get_default();
    hyprland.connect("notify::focused-workspace", () => {
      const currentWorkspaceId = `${hyprland.focusedWorkspace?.id ?? 1}`;
      applyCurrentDashboardState(currentWorkspaceId);
    });
  },
  requestHandler: requestHandler,
})
