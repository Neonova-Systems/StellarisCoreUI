import { Accessor, With } from "ags";
import { Gtk } from "ags/gtk4";
import giCairo from "cairo";
import { setSourceRGBAFromHex } from "./utility";

const criticalHex = "#3353F3"
type GraphProps = {
    title: string | Accessor<string> | undefined;
    valueToWatch: number[] | Accessor<number[]>;
    threshold?: number;
    fontSize?: number;
    lineWidth?: number;
    height?: number;
}

export default function CreateGraph({title, valueToWatch, threshold = 1, fontSize = 8.3, lineWidth = 1.3, height = 30}: GraphProps) {
    function drawGridBackground(area: Gtk.DrawingArea, cr: giCairo.Context, width: number, height: number, gridColor: string) {
        const gridSpacing = 7;

        setSourceRGBAFromHex(cr, gridColor, 0.1);
        for (let x = 0; x < width; x += gridSpacing) {
            for (let y = 0; y < height; y += gridSpacing) {
                cr.arc(x, y, 1, 0, 2 * Math.PI);
                cr.fill();
            }
        }
    }

    function renderChart(area: Gtk.DrawingArea, cr: giCairo.Context, width: number, height: number, dataPoints: number[], isCritical?: boolean) {
        const chartWidth = width;
        const chartHeight = height;
        const points = dataPoints.length ? dataPoints : [0];
        const segmentWidth = points.length > 1 ? chartWidth / (points.length - 1) : 0;
        const gridColor = isCritical ? criticalHex : "#1a39ed";

        drawGridBackground(area, cr, width, height, gridColor);

        setSourceRGBAFromHex(cr, isCritical ? criticalHex : "#1a39ed", 0.17); // Background
        cr.moveTo(0, height);
        cr.lineTo(0, chartHeight * (1 - points[0]));

        for (let i = 1; i < points.length; i++) {
            const x = segmentWidth * i;
            const y = chartHeight * (1 - points[i]);
            cr.lineTo(x, y);
        }
        cr.lineTo(width, height);
        cr.closePath();
        cr.fill();

        setSourceRGBAFromHex(cr, isCritical ? criticalHex : "#1a39ed", 1.0); // Line
        cr.setLineWidth(lineWidth);
        cr.moveTo(0, chartHeight * (1 - points[0]));

        for (let i = 1; i < points.length; i++) {
            const x = segmentWidth * i;
            const y = chartHeight * (1 - points[i]);
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
                            <box cssClasses={["graph-container", (isCritical ? "critical" : "")]}  halign={Gtk.Align.FILL}>
                                <box cssClasses={["separator", (isCritical ? "critical" : "")]} />
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <label label={title} css={`font-size: ${fontSize}px;`} cssClasses={[isCritical ? "critical" : ""]} />
                                    <drawingarea cssClasses={["graph", (isCritical ? "critical-graph" : "")]} css={`min-height: ${height}px;`} hexpand $={(self) => {
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
                                <drawingarea cssClasses={["graph", (isCritical ? "critical-graph" : "")]} css={`min-height: ${height}px;`} hexpand $={(self) => {
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