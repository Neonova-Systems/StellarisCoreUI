import { Accessor, createBinding, With } from "ags";
import { Gtk } from "ags/gtk4";
import giCairo from "cairo";
import { setSourceRGBAFromHex } from "./utility";

const criticalHex = "#F32626"
type GraphProps = {
    title: string | Accessor<string> | undefined;
    valueToWatch: number[] | Accessor<number[]>;
    threshold?: number;
    fontSize?: number;
    lineWidth?: number;
}

export default function CreateGraph({title, valueToWatch, threshold = 1, fontSize = 7, lineWidth = 1.3}: GraphProps) {
    function renderChart(area: Gtk.DrawingArea, cr: giCairo.Context, width: number, height: number, dataPoints: number[], isCritical?: boolean) {
        const padding = 1;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        const segmentWidth = chartWidth / (dataPoints.length - 1);

        setSourceRGBAFromHex(cr, isCritical ? criticalHex : "#1a39ed", 0.17); // Background
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

        setSourceRGBAFromHex(cr, isCritical ? criticalHex : "#1a39ed", 1.0); // Line
        cr.setLineWidth(lineWidth);
        cr.moveTo(padding, padding + chartHeight * (1 - dataPoints[0]));

        for (let i = 1; i < dataPoints.length; i++) {
            const x = padding + segmentWidth * i;
            const y = padding + chartHeight * (1 - dataPoints[i]);
            cr.lineTo(x, y);
        }
        cr.stroke();
    }

    return (
        <box cssClasses={[typeof valueToWatch == 'function' ? "apply-start-animation" : ""]}>
            {typeof valueToWatch === 'function' ? (
                <With value={valueToWatch}>
                    {(dataPoints) => {
                        const latestValue = dataPoints[dataPoints.length - 1] || 0;
                        const isCritical = (latestValue >= threshold);
                        return (
                            <box cssClasses={["graph-container", (isCritical ? "critical" : "")]} halign={Gtk.Align.FILL}>
                                <box cssClasses={["separator", (isCritical ? "critical" : "")]} />
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <label label={title} css={`font-size: ${fontSize}px;`} cssClasses={[isCritical ? "critical" : ""]} />
                                    <drawingarea cssClasses={["graph", (isCritical ? "critical-graph" : "")]} hexpand $={(self) => {
                                        self.set_draw_func((area, cr, width, height) => renderChart(area, cr, width, height, dataPoints, isCritical));
                                    }} />
                                </box>
                            </box>
                        )
                    }}
                </With>
            ) : (
                (() => {
                    const dataPoints = valueToWatch;
                    const latestValue = dataPoints[dataPoints.length - 1] || 0;
                    const isCritical = (latestValue >= threshold);
                    return (
                        <box cssClasses={["graph-container", (isCritical ? "critical" : "")]} halign={Gtk.Align.FILL}>
                            <box cssClasses={["separator", (isCritical ? "critical" : "")]} />
                            <box orientation={Gtk.Orientation.VERTICAL}>
                                <label label={title} css={`font-size: ${fontSize}px;`} cssClasses={[isCritical ? "critical" : ""]} />
                                <drawingarea cssClasses={["graph", (isCritical ? "critical-graph" : "")]} hexpand $={(self) => {
                                    self.set_draw_func((area, cr, width, height) => renderChart(area, cr, width, height, dataPoints, isCritical));
                                }} />
                            </box>
                        </box>
                    )
                })()
            )}
        </box>
    )
}