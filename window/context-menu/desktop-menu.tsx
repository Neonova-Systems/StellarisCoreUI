import { spawnContextMenu } from "../ContextMenu"

const commandsList = [
    { name: "Hide Desktop Icons", description: "Temporarily hide all desktop icons", command: "ags request 'toggleDesktopIcons'", keybind: "v"},
    { name: "Refresh Desktop", description: "Reload desktop icons and layout", command: "ags request 'refreshDesktop'", keybind: "r"},
    { name: "Terminal", description: "Open terminal in desktop directory", command: "/usr/bin/kitty --directory ~/Desktop", keybind: "t"},
    { name: "File Manager", description: "Open file manager in desktop directory", command: "/usr/bin/nautilus ~/Desktop", keybind: "e"},
    { name: "Create New Folder", description: "Create a new folder on desktop", command: "mkdir ~/Desktop/NewFolder && notify-send 'Folder Created'", keybind: ""},
    { name: "Change Wallpaper", description: "Open wallpaper selector", command: "ags request 'openWallpaperSelector'", keybind: ""},
    { name: "Display Settings", description: "Open display configuration", command: "/usr/bin/hyprctl dispatch exec gnome-control-center display", keybind: ""},
    // { name: "Sort Icons by Name", description: "Arrange desktop icons alphabetically", command: "ags request 'sortDesktopByName'", keybind: ""},
    // { name: "Sort Icons by Type", description: "Group desktop icons by file type", command: "ags request 'sortDesktopByType'", keybind: ""},
    // { name: "Clean Up Desktop", description: "Auto-arrange desktop icons in grid", command: "ags request 'cleanupDesktop'", keybind: ""},
]
spawnContextMenu(commandsList);