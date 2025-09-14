import app from "ags/gtk4/app"
import style from "./style.scss"
import Dashboard from "./widget/Dashboard"
import GLib from "gi://GLib?version=2.0"
import { BottomRightCorner, TopRightCorner, BottomLeftCorner, TopLeftCorner } from "./widget/Corners"
import { applyCurrentDashboardState, requestHandler } from "./services"

app.start({
    css: style,
    gtkTheme: "adw-gtk3-dark",
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
    requestHandler: requestHandler,
})
