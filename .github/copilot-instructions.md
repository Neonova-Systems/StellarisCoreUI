# AGS Stellaris Core UI - AI Agent Guide

## Architecture Overview

**Entry Point**: `app.ts` → `app.start({ css, main(), requestHandler })`
- `main()`: Mounts windows per monitor (Dashboard, TopRightCorner, BottomLeftCorner, etc.)
- `requestHandler`: Central message bus in `services.ts` handling state toggles via `ags request "command"`
- State persistence: JSON files in `~/.cache/ags/` (dashboard-state.json, dashboard-cards-order.json, wallpaper.json)

**Component Structure**:
- `widget/` — Full-screen windows (Dashboard.tsx, Corners.tsx, Screen.tsx)
- `card/` — Collapsible panels inside widgets (system-info.tsx, hardware-info.tsx)
- `helper/` — Utilities (CreatePanel, panelClicked, playSound, JSON IO, Cairo drawing)
- `modules/` — Standalone UI elements (wallpaper.tsx, notifications.tsx)
- `window/context-menu/` — Right-click menus spawned via separate AGS instances

## Critical Patterns & Idioms

### State Management
**Centralized state**: `services.ts` defines `stateKeys` object mapping property names to request names
```tsx
// Auto-generates toggle/get handlers for all dashboard states
const stateKeys = { visible: "Dashboard", dataStreamVisible: "DataStream", ... }
// Creates: "toggleDashboard", "getDashboardState", "toggleDataStream", etc.
```

**Panel click pattern** (from `helper/behaviour.ts`):
```tsx
const [isVisible, setIsVisible] = createState(false);
<CreatePanel onClicked={() => panelClicked("SystemInfo", setIsVisible)}>
// Executes: ags request "toggleSystemInfo"
```

**Component state initialization**:
```tsx
timeout(500, () => { 
    execAsync('ags request "getSystemInfoState"').then(out => setVisible(out === 'true')) 
});
```

### Reactive Rendering
**Always wrap conditional JSX with `With` component** (implicit return with parentheses):
```tsx
<With value={toggleState}>
    {(v) => (  // Parentheses for implicit return!
        <box visible={v}>...</box>
    )}
</With>
```

**Performance**: Use `interval()`/`timeout()` for polling, clean up with `.cancel()` in `onCleanup()` or component state checks

### Cairo Custom Drawing
**Pattern**: `<drawingarea>` with `$draw_func` for custom shapes (see `helper/draw-function.tsx`):
```tsx
import { Corner, drawChamferedButton } from './helper/draw-function';
<drawingarea $={(self) => self.set_draw_func((area, cr, width, height) => 
    drawChamferedButton({ area, cr, width, height, 
        notchPlacements: [{ corner: Corner.TopRight }] })
)} />
```
**Key**: CSS filters DON'T affect Cairo drawings; use `setSourceRGBAFromHex()` helper

### Audio System
**Enum-based audio** (`helper/utility.ts`):
```tsx
export enum AudioFile { Panel = "panels.wav", Error = "error.wav", ... }
playSound(AudioFile.Panel, 500);
```

### File Operations
**JSON persistence** (`helper/json.ts`):
```tsx
import { readJson, writeJson, DASHBOARD_STATE_JSON } from './helper';
const state = readJson<DashboardState>(DASHBOARD_STATE_JSON, defaultState);
writeJson(DASHBOARD_STATE_JSON, updatedState);
```

### GTK/GObject Patterns
- Import GI modules: `import Gio from 'gi://Gio?version=2.0'`
- File dialogs: Use `Gtk.FileDialog()` with `Gio.ListStore` for filters
- Pictures: Use `contentFit={Gtk.ContentFit.CONTAIN}` and wrap in `Adw.Clamp` for size constraints
- Enums preferred: `Corner.TopRight`, `AudioFile.Notification` (not strings)

## System Integration

**Shell commands**: Always use `execAsync(['cmd', 'arg'])` array form or quote carefully in string form:
```tsx
execAsync(['dash', '-c', 'pacman -Qq | wc -l'])
execAsync(`dash ${HOME_DIR}/.config/ags/scripts/system-update.sh`)
```

**External tools used**: `dash`, `pacman`, `systemd-analyze`, `upower`, `mpstat`, `swww`, `hyprctl`, `pkexec`, `aplay`

**Hyprland integration** (`services.ts`):
- Dashboard visibility toggles corner margins and writes `~/.config/hypr/reserved-space.conf`
- Use `AstalHyprland.get_default()` for monitor/workspace queries

## Key Files & Their Roles

- `services.ts` — Request handler, state management, Hyprland space reservation
- `helper/behaviour.ts` — `panelClicked()` utility for panel toggles
- `helper/utility.ts` — Sound system (`AudioFile` enum), Cairo helpers, data formatting
- `helper/draw-function.tsx` — `drawChamferedButton()` with `Corner` enum for notched shapes
- `helper/dashboard-cards.ts` — Drag-and-drop card reordering with JSON persistence
- `widget/Screen.tsx` — Desktop icons from `~/Desktop/*.desktop` files
- `card/data-stream/system-info.tsx` — System metrics with `CreateUtilityButton` for updates

## What NOT to Change Without Confirmation

1. Window names (must match `app.get_window("Name")` and `services.ts` state keys)
2. Request handler command strings (e.g., "toggleDashboard", "refresh desktop")
3. JSON file locations (all in `~/.cache/ags/` via `helper/constants.ts`)
4. Hyprland config writes (`~/.config/hypr/reserved-space.conf`)
5. `stateKeys` object structure (auto-generates request handlers)

## Development Workflow

**Run**: AGS CLI required (not npm scripts). Likely `ags` or `ags run` (confirm with maintainer)
**Typecheck**: `tsc --noEmit`
**Context menus**: Spawn separate AGS instances with `ags run path/to/menu.tsx --gtk 4`
**Debugging**: Check `~/.cache/ags/*.json` for persisted state; use `console.log()` and AGS logs

## Common Tasks

**Add new panel state**:
1. Add to `stateKeys` in `services.ts`
2. Initialize with `timeout(500, () => execAsync('ags request "getNewPanelState"')...)`
3. Connect panel: `<CreatePanel onClicked={() => panelClicked("NewPanel", setState)}>`

**Add new audio**:
1. Add to `AudioFile` enum in `helper/utility.ts`
2. Create wrapper: `export function playNewSound(ms = 100) { playSound(AudioFile.New, ms); }`

**Custom Cairo shape**:
1. Use `drawChamferedButton()` with `notchPlacements: [{ corner: Corner.*, size?: number }]`
2. Or create new function following `helper/draw-function.tsx` pattern with `setSourceRGBAFromHex()`

**New dashboard card**:
1. Add to `componentMap` in `helper/dashboard-cards.ts`
2. Update `CardId` type and `DEFAULT_ORDER`
