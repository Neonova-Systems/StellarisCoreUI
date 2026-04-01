import { Accessor, createState, For, With } from "ags";
import { Gdk, Gtk } from "ags/gtk4";
import { timeout } from "ags/time";
import Gio from "gi://Gio";
import { Align, HOME_DIR } from "./constants";
import Adw from "gi://Adw?version=1";

function resolveDisabled(disabled: boolean | Accessor<boolean> | undefined): boolean {
    if (disabled === undefined) return false;
    if (typeof disabled === "boolean") return disabled;
    if (typeof disabled === "function") return disabled();
    return false;
}

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
     * When true or accessor evaluates true, disables interaction (dragging and clicking).
     *
     * @defaultValue false
     */
    disabled?: boolean | Accessor<boolean> | undefined;
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
export function CreateSlider({ value, onChange, disabled = false }: CreateSliderProps) {
    const [resolvedSegmentCount, setResolvedSegmentCount] = createState(0);
    const [segmentIndexes, setSegmentIndexes] = createState<number[]>([]);
    const [isDraggingSegments, setIsDraggingSegments] = createState(false);
    const [disabledState] = typeof disabled === "function" ? [disabled] : [createState(disabled)[0]];
    let dragStartX = 0;
    let trackWidget: Gtk.Box | null = null;

    function recalculateSegmentsForWidth(width: number) {
        // Segment density is controlled by CSS spacing/width; calculate count from width alone.
        const dynamicCount = width > 0 ? Math.max(1, Math.floor(width / 5)) : 0;
        const nextCount = dynamicCount;
        if (nextCount !== resolvedSegmentCount.peek()) {
            setResolvedSegmentCount(nextCount);
            setSegmentIndexes(Array.from({ length: nextCount }, (_, i) => i));
        }
    }

    function setVolumeFromSegment(index: number) {
        const count = resolvedSegmentCount.peek();
        if (count <= 0) return;
        const next = Math.round(((index + 1) / count) * 100);
        onChange(next);
    }

    function setVolumeFromTrackPosition(x: number) {
        if (!trackWidget) return;

        const width = trackWidget.get_width();
        recalculateSegmentsForWidth(width);
        if (width <= 0) return;
        const count = resolvedSegmentCount.peek();
        if (count <= 0) return;
        const ratio = Math.max(0, Math.min(1, x / width));
        const index = Math.min(count - 1, Math.floor(ratio * count));
        setVolumeFromSegment(index);
    }

    function beginSegmentDrag(self: Gtk.GestureDrag) {
        if (resolveDisabled(disabled)) return;
        const [hasPoint, startX] = self.get_start_point();
        dragStartX = hasPoint ? startX : 0;
        setIsDraggingSegments(true);
        setVolumeFromTrackPosition(dragStartX);
    }

    function updateSegmentDrag(self: Gtk.GestureDrag) {
        if (resolveDisabled(disabled)) return;
        const [, offsetX] = self.get_offset();
        setVolumeFromTrackPosition(dragStartX + offsetX);
    }

    function endSegmentDrag() {
        setIsDraggingSegments(false);
    }

    return (
        <With value={disabledState}>
            {(_) => {
                const isDisabled = resolveDisabled(disabled);
                return (
        <overlay>
            <box cssClasses={["slider-segment-track", ...(isDisabled ? ["disabled"] : [])]}
                spacing={1} halign={Align.FILL} hexpand
                $={(self) => {
                    trackWidget = self;
                    const updateCount = () => recalculateSegmentsForWidth(self.get_width());
                    // Width allocation can settle over multiple frames at startup.
                    // Recalculate a few times so we converge even if notify::width is late or skipped.
                    [0, 16, 48, 120, 250].forEach((ms) => timeout(ms, updateCount));
                    self.connect("notify::width", updateCount);
                }} cursor={isDisabled ? Gdk.Cursor.new_from_name("not-allowed", null) : undefined}>
                <Gtk.GestureDrag onDragBegin={beginSegmentDrag} onDragUpdate={updateSegmentDrag} onDragEnd={endSegmentDrag} />
                <For each={segmentIndexes}>
                    {(index) => (
                        <button cssClasses={["slider-segment-button"]} onClicked={() => !isDisabled && setVolumeFromSegment(index)}>
                            <With value={value}>
                                {(v) => {
                                    const count = resolvedSegmentCount.peek();
                                    const filledCount = Math.max(0, Math.ceil((v / 100) * count));
                                    const focusIndex = Math.max(0, filledCount - 1);
                                    const focusTrailing1 = Math.max(0, filledCount - 2);
                                    const focusTrailing2 = Math.max(0, filledCount - 3);
                                    const focusTrailing3 = Math.max(0, filledCount - 4);
                                    return (
                                        <box
                                            cssClasses={[
                                                "slider-segment",
                                                (index < filledCount ? "filled" : ""),
                                                (index === focusTrailing1 && focusTrailing1 !== 0 ? "apply-motion-slider1" : ""),
                                                (index === focusTrailing2 && focusTrailing2 !== 0 ? "apply-motion-slider2" : ""),
                                                (index === focusTrailing3 && focusTrailing3 !== 0 ? "apply-motion-slider3" : ""),
                                                (index === focusIndex ? "focus" : ""),
                                                (isDraggingSegments.peek() && index === focusIndex ? "dragging" : ""),
                                            ]}
                                        />
                                    );
                                }}
                            </With>
                        </button>
                    )}
                </For>
            </box>
            <Adw.Clamp maximumSize={4} $type="overlay" marginEnd={2} valign={Align.TOP} halign={Align.RIGHT}>
                <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ornament/triangle-invert.svg`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
            </Adw.Clamp>
            <Adw.Clamp maximumSize={4} $type="overlay" marginEnd={2} valign={Align.BOTTOM} halign={Align.RIGHT}>
                <Gtk.Picture file={Gio.File.new_for_path(`${HOME_DIR}/.config/ags/assets/ornament/triangle.svg`)} canShrink={true} contentFit={Gtk.ContentFit.CONTAIN} />
            </Adw.Clamp>
        </overlay>
                );
            }}
        </With>
    );
}