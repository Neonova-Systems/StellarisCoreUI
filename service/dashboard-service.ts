import app from "ags/gtk4/app";
import { Astal } from "gi://Astal?version=4.0";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import {
  DASHBOARD_VISIBLE_WORKSPACE_STATE_JSON,
  writeJson,
  readJson,
} from "../helper";
import { execAsync } from "ags/process";

type WorkspaceState = { visible: boolean };

// Key is the workspace ID string, value is the visibility state object
type State = Record<string, WorkspaceState>;

const defaultSchema: State = {
  "1": { visible: false },
  "2": { visible: true },
  "3": { visible: false },
  "4": { visible: true },
  "5": { visible: true },
  "6": { visible: true },
  "7": { visible: true },
  "8": { visible: true },
  "9": { visible: true },
};

let visibleState = readJson<State>(
  DASHBOARD_VISIBLE_WORKSPACE_STATE_JSON,
  defaultSchema,
);
const hyprland = AstalHyprland.get_default();

// Base gaps_out captured when the dashboard opens and restored when it
// closes. Re-reading gaps_out while open sees the already-inflated value,
// so the base would grow by the offset on every toggle.
let savedBaseGap: number | null = null;

// Read the current base gap from hyprctl (first token of gaps_out CSS string)
async function getBaseGap(): Promise<number> {
  try {
    const out = await execAsync(`hyprctl getoption general:gaps_out -j`);
    const css = (JSON.parse(out) as { css?: string }).css ?? "10 10 10 10";
    const first = css.trim().split(/\s+/)[0];
    const n = Number(first);
    return Number.isFinite(n) ? n : 10;
  } catch {
    return 10;
  }
}

export async function applyCurrentDashboardState(targetWorkspaceId?: string) {
  const currentWorkspaceId =
    targetWorkspaceId || `${hyprland.focusedWorkspace?.id ?? 1}`;

  const isDashboardVisible = !!(
    visibleState[currentWorkspaceId]?.visible ?? false
  );
  const dashboard = app.get_window("Dashboard") as Astal.Window | undefined;
  const topLeftCorner = app.get_window("TopLeftCorner") as
    Astal.Window | undefined;
  const topRightCorner = app.get_window("TopRightCorner") as
    Astal.Window | undefined;
  const bottomLeftCorner = app.get_window("BottomLeftCorner") as
    Astal.Window | undefined;
  const bottomRightCorner = app.get_window("BottomRightCorner") as
    Astal.Window | undefined;

  if (dashboard) {
    dashboard.visible = isDashboardVisible;
  }

  if (isDashboardVisible) {
    // Snapshot the base outer gap once so subsequent calls don't re-read
    // the already-inflated value and stack the offset on top.
    savedBaseGap = savedBaseGap ?? (await getBaseGap());
    const hyprlandGaps = savedBaseGap;
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
    hyprland.message(
      `eval hl.config({ general = { gaps_out = { top = ${10 + hyprlandGaps}, right = ${10 + hyprlandGaps}, bottom = ${marginBottom + hyprlandGaps}, left = ${marginLeft + hyprlandGaps}} } })`,
    );
  } else {
    // Restore the saved base gap instead of re-reading (which would see
    // the inflated value and grow on every toggle).
    const hyprlandGaps = savedBaseGap ?? (await getBaseGap());
    savedBaseGap = null;

    if (topLeftCorner) {
      topLeftCorner.marginLeft = topLeftCorner.marginTop = 0;
    }
    if (bottomLeftCorner) {
      bottomLeftCorner.marginBottom = bottomLeftCorner.marginLeft = 0;
    }
    if (topRightCorner) {
      topRightCorner.marginRight = topRightCorner.marginTop = 0;
    }
    if (bottomRightCorner) {
      bottomRightCorner.marginBottom = bottomRightCorner.marginRight = 0;
    }

    hyprland.message(
      `eval hl.config({ general = { gaps_out = ${hyprlandGaps} } })`,
    );
  }
}

export function serviceCallback(res: (response: any) => void) {
  const currentWorkspaceId = `${hyprland.focusedWorkspace.id}`;
  const currentStatus = visibleState[currentWorkspaceId]?.visible ?? false;
  const newStatus = !currentStatus;

  visibleState[currentWorkspaceId] = { visible: newStatus };
  writeJson(DASHBOARD_VISIBLE_WORKSPACE_STATE_JSON, visibleState);

  applyCurrentDashboardState(currentWorkspaceId);
  res(
    `Workspace ${currentWorkspaceId} Dashboard: ${newStatus ? "Visible" : "Hidden"}`,
  );
}
