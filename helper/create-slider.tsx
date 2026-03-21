import { Accessor, createState, With } from "ags";
import { Gtk } from "ags/gtk4";
import { Align } from "./constants";

/**
 * Props for creating the segmented volume slider widget.
 */
type CreateSliderProps = {
    /**
     * Reactive slider value in percent, expected in the `0..100` range.
     */
    value: Accessor<number>;

    /**
     * Called when user interaction requests a new slider percent value.
     */
    onChange: (nextPercent: number) => void;

    /**
     * Number of visual segments rendered in the slider track.
     *
     * @defaultValue 24
     */
    segmentCount?: number;
};

/**
 * Creates a segmented, draggable slider widget used for volume control.
 *
 * The slider supports:
 * - click-to-set via individual segments,
 * - drag-to-adjust across the whole track,
 * - reactive fill/focus rendering from a percentage accessor.
 *
 * @param props - Slider configuration and bindings.
 * @returns A JSX element representing the custom segmented slider.
 */
export function CreateSlider({ value, onChange, segmentCount = 24 }: CreateSliderProps) {
    const segments = Array.from({ length: segmentCount });
    const [isDraggingSegments, setIsDraggingSegments] = createState(false);
    let dragStartX = 0;
    let trackWidget: Gtk.Box | null = null;

    function setVolumeFromSegment(index: number) {
        const next = Math.round(((index + 1) / segmentCount) * 100);
        onChange(next);
    }

    function setVolumeFromTrackPosition(x: number) {
        if (!trackWidget) return;

        const width = Math.max(trackWidget.get_width(), 1);
        const ratio = Math.max(0, Math.min(1, x / width));
        const index = Math.min(segmentCount - 1, Math.floor(ratio * segmentCount));
        setVolumeFromSegment(index);
    }

    function beginSegmentDrag(self: Gtk.GestureDrag) {
        const [hasPoint, startX] = self.get_start_point();
        dragStartX = hasPoint ? startX : 0;
        setIsDraggingSegments(true);
        setVolumeFromTrackPosition(dragStartX);
    }

    function updateSegmentDrag(self: Gtk.GestureDrag) {
        const [, offsetX] = self.get_offset();
        setVolumeFromTrackPosition(dragStartX + offsetX);
    }

    function endSegmentDrag() {
        setIsDraggingSegments(false);
    }

    return (
        <box cssClasses={["volume-segment-track"]} spacing={1} halign={Align.FILL} hexpand $={(self) => { trackWidget = self; }}>
            <Gtk.GestureDrag onDragBegin={beginSegmentDrag} onDragUpdate={updateSegmentDrag} onDragEnd={endSegmentDrag} />
            {segments.map((_, index) => (
                <button cssClasses={["volume-segment-button"]} onClicked={() => setVolumeFromSegment(index)}>
                    <With value={value}>
                        {(v) => {
                            const filledCount = Math.max(0, Math.ceil((v / 100) * segmentCount));
                            const focusIndex = Math.max(0, filledCount - 1);
                            return (
                                <box
                                    cssClasses={[
                                        "volume-segment",
                                        ...(index < filledCount ? ["filled"] : []),
                                        ...(index === focusIndex ? ["focus"] : []),
                                        ...(isDraggingSegments.peek() && index === focusIndex ? ["dragging"] : []),
                                    ]}
                                />
                            );
                        }}
                    </With>
                </button>
            ))}
        </box>
    );
}