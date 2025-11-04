import { Accessor, With } from "ags";
import { Gtk } from "ags/gtk4";
import giCairo from "cairo";
import { setSourceRGBAFromHex } from "./utility";

type GraphProps = {
    title: string | Accessor<string> | undefined;
    valueToWatch: Accessor<number[]>;
    critical: boolean | Accessor<boolean>
}

export default function CreateGraph({title, valueToWatch, critical = false}: GraphProps) {
    function renderChart(area: Gtk.DrawingArea, cr: giCairo.Context, width: number, height: number, dataPoints: number[]) {
        const padding = 1;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const segmentWidth = chartWidth / (dataPoints.length - 1);

        setSourceRGBAFromHex(cr, "#1a39ed", 0.17); // Background
        cr.moveTo(padding, height - padding);
        cr.lineTo(padding, padding + chartHeight * (1 - dataPoints[0]));

        for (let i = 1; i < dataPoints.length; i++) {
            const x = padding + segmentWidth * i;
            const y = padding + chartHeight * (1 - dataPoints[i]);
            cr.lineTo(x, y);
        }
        cr.lineTo(width - padding, height - padding);
        cr.closePath();
        cr.fill();

        setSourceRGBAFromHex(cr, "#1a39ed", 1.0); // Line
        cr.setLineWidth(2);
        cr.moveTo(padding, padding + chartHeight * (1 - dataPoints[0]));

        for (let i = 1; i < dataPoints.length; i++) {
            const x = padding + segmentWidth * i;
            const y = padding + chartHeight * (1 - dataPoints[i]);
            cr.lineTo(x, y);
        }
        cr.stroke();
    }

    return (
        <box cssClasses={["graph-container", (critical ? "critical" : "")]} marginStart={10} marginEnd={10} marginTop={10} marginBottom={5} orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL}>
            <label label={title} cssClasses={[critical ? "critical" : ""]}/>
            <With value={valueToWatch}>
                {(dataPoints) => (
                    <drawingarea cssClasses={["graph", (critical ? "critical-graph" : "")]} hexpand $={(self) => {
                        self.set_draw_func((area, cr, width, height) => renderChart(area, cr, width, height, dataPoints));
                    }} />
                )}
            </With>
        </box>
    )
}