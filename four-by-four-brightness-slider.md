# Four by four: connect the brightness slider to real brightness

Target: `card/control-center/hyprland-control.tsx` brightness slider →
`brightnessctl`. Date: 2026-11-07. Branch: `experimental` @ `9fcc1e0`.

## 1. Product

**What does the user see, and when?**
Nothing today. `applyBrightness` only writes local state, so the slider never
touches hardware. It is also wrong on open: the state starts at `createState(50)`
while the panel was physically at 35% (`brightnessctl -d intel_backlight info`).
After the change the slider reads real hardware on open and dims the panel on drag.

**Smallest version that proves it works?**
`scripts/set-brightness <0-100>` plus one read on mount. Slider drag changes
screen brightness. No keybinds, no DDC/CI, no multi-monitor.

**What breaks if this is never shipped?**
The slider merged in `9fcc1e0` stays decorative and keeps displaying a hardcoded
50% that has nothing to do with the panel. That is a live bug, not a missing feature.

**What does this replace, and what dies with it?**
Nothing. It activates dead code. The row, slider and entry are already rendered.

## 2. Software design

**What data moves, and where does it live before and after?**
Brightness percent. Before: memory only, discarded on close. After: the source of
truth is sysfs, read through `brightnessctl`. Observed device: `intel_backlight`,
class `backlight`, max `24000`. One device, no selection needed. The user is in the
`video` group, so writes work without root.

**Failure modes and fallbacks?**

| Failure | Fallback |
| --- | --- |
| `brightnessctl` missing | script exits 1 with a message, card shows `N/A`, slider disabled |
| no backlight device (desktop / external only) | same: `N/A` plus a disabled slider |
| permission denied on write | script exits non-zero and prints the error, row keeps last value |
| device disappears between read and write | `brightnessctl` fails, script exits non-zero, nothing else changes |

`ddcutil` is not installed, so external monitors over DDC/CI are out of scope and
explicitly not attempted.

**Interface, and who consumes it?**
Follows `scripts/set-innergap-ratio`: bash, `set -euo pipefail`, echoes the
resulting value on stdout.

- `scripts/get-brightness` → integer percent, or exit 1 when no device.
- `scripts/set-brightness <0-100>` → integer percent actually applied, or exit 1.

Absolute only. Delta syntax (`+10`) was considered for Hyprland binds on
`XF86MonBrightnessUp/Down` and deliberately left out: no caller needs it yet.

**What already exists that this duplicates?**
`brightnessctl` already does device discovery, min-value clamping and percentage
math, so the scripts stay thin. A raw sysfs writer would duplicate all three.
`light` is also installed, but a fallback chain was rejected as untestable extra paths.

## 3. Practical

**Anything on a schedule or timer?**
This is the main risk. `hyprland-control.tsx` polls gaps on `interval(2500, refreshGaps)`.
Polling brightness on the same tick would overwrite the slider mid-drag and stomp
changes made by hotkeys or another machine. Decided: **read once on mount, no poll.**
`9943c41` and `847f7a0` are prior fixes for exactly this class of bug (re-reading a
value the widget had just inflated), so brightness inherits it for free if polled.

**Migration, backfill, things left readable?**
None. No on-disk state, no config, no saved file.

**Cost per run?**
One `execAsync` process spawn per committed change. Drag emits continuously, so
writes are debounced at 40 ms — the same value gaps already use.

**What has to be true for a quiet rollback?**
Both scripts are new files and the TSX change is confined to the brightness row plus
two state cells. `git revert` on the commit, or `git rm` the two scripts, leaves no
residue. No database, no cache, no external state to unwind.

## 4. Edge cases

**What input does this not handle, and what does it do instead?**
Non-numeric and negative input exits 1 with a usage line. `0` is refused rather
than honoured: a true 0% backlight can black out the panel mid-session, so the
floor is clamped to 1, matching `brightnessctl`'s own `-n` default. Above 100 clamps
to 100.

**Boundary: first, last, empty, full?**
First open: value read before first paint of the row where possible, and if the read
loses the race the row shows the last known value. Empty (no device): `N/A` with a
disabled slider. Full: 100%. Multiple devices: `brightnessctl` picks the first in list
order, and its own wildcard behaviour is not overridden.

**Under load, or after a long time?**
Rapid drags collapse through the debounce, so at most one spawn per 40 ms window.
A late reply cannot clobber a newer one: a revision counter drops stale results,
the same guard `applyGaps` uses. The read-once choice means the display can go stale
if brightness changes while the dashboard is open — accepted, and it self-corrects
on next open.

**What did the last version get wrong?**
The gaps slider re-read a value it had just inflated, so the offset stacked on
every toggle until `9943c41` snapshotted the base. The lesson applied here: never
treat a poll as ground truth for a value you are currently editing.

## Decisions

1. Backend: `brightnessctl` only.
2. Consumers: dashboard, absolute values only.
3. Sync: read once on mount, no poll, debounced writes.
4. No device: keep the row, show `N/A`, disable the slider.

## Not doing

- DDC/CI or `ddcutil` external-monitor support.
- Delta syntax and Hyprland keybinds.
- Polling brightness.
- Hiding the row when unavailable.
