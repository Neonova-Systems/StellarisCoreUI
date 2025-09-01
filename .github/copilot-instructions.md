Purpose
-------
This file is a compact, actionable guide for an AI coding agent (Copilot-style) to become immediately productive in this repo.

High-level checklist
- Understand the entrypoint: `app.ts` and how windows/widgets are mounted
- Follow UI component pattern: `widget/`, `card/`, `helper/` directories
- Respect AGS/JSX conventions (imports from `ags`, `gi://` modules, `createState`, `With`)
- Note external integrations (Hyprland via `AstalHyprland`, system calls like `upower`)
- Confirm developer run/build commands (not found in `package.json`)

Quick architecture summary
- Entrypoint: `app.ts` — calls `app.start({ css, main(), requestHandler })`. `main()` mounts UI functions for each monitor: `Dashboard`, `TopRightCorner`, etc.
- Widgets: `widget/` contains the functions/components that create windows. Each widget is invoked with a monitor and should return or configure a window named in code (e.g., `Dashboard`, `TopLeftCorner`).
- Cards: `card/` holds small UI panels shown inside widgets (example: `card/battery-info.tsx` uses `createState`, `execAsync`, and helper components).
- Helpers: `helper/` contains reusable UI helper components (`CreatePanel`, `CreateEntryContent`) and utilities (`playPanelSound`, `utility`, file IO wrappers).

Conventions & idioms to follow (examples)
- Reactive state: prefer `createState` for component-local state and `With` for conditional rendering (see `card/battery-info.tsx`).
- JSX + Gtk: files are `.tsx`, use `ags/gtk4` as JSX import source (see `tsconfig.json` -> `jsxImportSource: "ags/gtk4"`).
- Naming: window names are matched in `app.requestHandler()` by `app.get_window("Name")`; changes to names must be mirrored in `app.ts`.
- Styling: SCSS files (`style.scss`, `animation.scss`) are passed to `app.start({ css })`; update them for visual changes.
- System calls: native tooling is used via `execAsync` (e.g., `upower` in `battery-info.tsx`) — prefer quoting and safe shell usage and treat outputs as untrusted.

Integration points & external dependencies
- AGS runtime (import `ags` and `ags/gtk4`). `package.json` declares `ags` as a dependency but exposes no scripts — running requires the AGS runtime/environment.
- GObject Introspection modules imported with `gi://` URIs (examples: `AstalHyprland`, `GLib`, many `@girs/*.d.ts` types).
- Shell utilities: components call `upower`, `dash` via `execAsync` (see `card/battery-info.tsx`). Tests or CI must run on a Linux environment with these utilities available.
- Filesystem interactions: writes to `~/.config/hypr/reserved-space.conf` (in `app.ts`) — permissions and side-effects matter when running locally or in CI.

Developer workflows (what I could discover)
- No npm scripts or test harness in `package.json`. The repo relies on the AGS environment. Action required: ask the maintainer for the exact run command (examples to confirm):
  - `ags run` or `node --loader ts-node/esm app.ts` (speculative) — DO NOT assume; ask to confirm.
- Build/Typecheck: `tsconfig.json` is present. Use `tsc --noEmit` to typecheck locally.

Where to look for canonical examples
- Window + monitor mounting: `app.ts`
- System integration + stateful card: `card/battery-info.tsx`
- Helpers & patterns: `helper/create-panel.tsx`, `helper/create-entry-content.tsx` (follow these for UI composition)

What the agent should NOT change silently
- Window naming and `app.requestHandler()` message strings (e.g., "toggleDashboard")
- Paths writing to the user's config (`~/.config/hypr/reserved-space.conf`) without explicit confirmation
- SCSS import and `app.start({ css })` usage — keep CSS wiring intact

Gaps / follow-ups for the human maintainer
- Add run and debug instructions to `package.json` or README. I couldn't find scripts. Please provide the canonical command to start the app in dev mode.
- If there are CI/test expectations, add a minimal test runner or scripts.

If anything above is unclear, reply with the missing run/debug commands and any preferred CI behaviors and I will update this file.
