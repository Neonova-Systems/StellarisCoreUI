import app from "ags/gtk4/app"
import { Astal } from "gi://Astal?version=4.0"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import { DASHBOARD_VISIBLE_WORKSPACE_STATE_JSON, writeJson, readJson, HOME_DIR } from "../helper";
import { writeFile } from "ags/file";

type WorkspaceState = {
  visible: boolean;
};

// Key is the workspace ID string, value is the visibility state object
type State = Record<string, WorkspaceState>;
let visibleState = readJson<State>(DASHBOARD_VISIBLE_WORKSPACE_STATE_JSON, {});
const hyprland = AstalHyprland.get_default();
const focusedWorkspace = hyprland.focusedWorkspace;
const workspaceId = `${focusedWorkspace.id}`;

export function applyCurrentDashboardState() {
  const isDashboardVisible = visibleState[workspaceId]?.visible ?? false;
  const dashboard = app.get_window("Dashboard") as Astal.Window | undefined;
  const topLeftCorner = app.get_window("TopLeftCorner") as Astal.Window | undefined;
  const topRightCorner = app.get_window("TopRightCorner") as Astal.Window | undefined;
  const bottomLeftCorner = app.get_window("BottomLeftCorner") as Astal.Window | undefined;
  const bottomRightCorner = app.get_window("BottomRightCorner") as Astal.Window | undefined;

  if (dashboard) { dashboard.visible = isDashboardVisible; }

  if (isDashboardVisible) {
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
      writeFile(`${HOME_DIR}/.config/hypr/reserved-space.lua`, `hl.monitor({ output = "${monitor.name}", reserved_area = { top = 10, bottom = ${bottom_space}, left = ${left_space}, right = 10 } })`);
    });
  } else {
    if (topLeftCorner) { topLeftCorner.marginLeft = topLeftCorner.marginTop = 0; }
    if (bottomLeftCorner) { bottomLeftCorner.marginBottom = bottomLeftCorner.marginLeft = 0; }
    if (topRightCorner) { topRightCorner.marginRight = topRightCorner.marginTop = 0; }
    if (bottomRightCorner) { bottomRightCorner.marginBottom = bottomRightCorner.marginRight = 0; }
    hyprland.get_monitors().forEach((monitor) => { writeFile(`${HOME_DIR}/.config/hypr/reserved-space.lua`, `hl.monitor({ output = "${monitor.name}", reserved_area = 0})`); });
  }
}

export function serviceCallback(res: (response: any) => void) {
  const currentWorkspaceId = `${hyprland.focusedWorkspace.id}`;
  // Get current status or default to false
  const currentStatus = visibleState[currentWorkspaceId]?.visible ?? false;
  const newStatus = !currentStatus;

  visibleState[currentWorkspaceId] = { visible: newStatus };
  writeJson(DASHBOARD_VISIBLE_WORKSPACE_STATE_JSON, visibleState);

  applyCurrentDashboardState();
  res(`Workspace ${currentWorkspaceId} Dashboard: ${newStatus ? "Visible" : "Hidden"}`);
}
