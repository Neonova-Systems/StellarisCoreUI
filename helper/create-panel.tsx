import { Gdk, Gtk } from "ags/gtk4"
import { Accessor, createState } from "ags"
import { HOME_DIR } from "./constants";
import { playHoverSound } from "./utility";

type PanelProps = {
    name?: string | Accessor<string> | undefined;
    onClicked?: ((source: Gtk.Button) => void) | undefined;
    $?: ((self: Gtk.Button) => void) | undefined;
    children?: JSX.Element | Array<JSX.Element>;
    draggable?: boolean | Accessor<NonNullable<boolean | undefined>> | undefined;
    onDragUp?: (() => void) | undefined;
    onDragDown?: (() => void) | undefined;
    onRightClick?: (() => void) | undefined;
    tooltipText?: string | Accessor<string> | undefined;
};

export default function CreatePanel({ name, onClicked, $, children, draggable = false, onDragUp, onDragDown, onRightClick, tooltipText }: PanelProps) {
    let lastY: number | null = null;
    let dragDirection: 'up' | 'down' | null = null;
    let lastOutputY: number | null = null;
    const DRAG_THRESHOLD = 25; // px

    function handleDragBegin(self: Gtk.GestureDrag) {
        lastY = null;
        dragDirection = null;
        lastOutputY = null;
    }

    function handleDragEnd(self: Gtk.GestureDrag) {
        lastY = null;
        dragDirection = null;
        lastOutputY = null;
    }

    function handleDragUpdate(self: Gtk.GestureDrag) {
        // get current drag position
        const [offsetX, offsetY] = self.get_offset();
        if (lastY !== null) {
            if (offsetY > lastY) {
                dragDirection = 'up'; // was 'down'
            } else if (offsetY < lastY) {
                dragDirection = 'down'; // was 'up'
            }
            if (dragDirection) {
                // Only output if moved more than threshold since last output
                if (lastOutputY === null || Math.abs(offsetY - lastOutputY) >= DRAG_THRESHOLD) {
                    console.log('Dragging', dragDirection);
                    if (dragDirection === 'up' && onDragUp) {
                        onDragUp();
                    } else if (dragDirection === 'down' && onDragDown) {
                        onDragDown();
                    }
                    lastOutputY = offsetY;
                }
            }
        }
        lastY = offsetY;
    }

    return (
        <button $={$} cssClasses={["panel"]} onMoveFocus={() => console.log("test")} onClicked={onClicked} cursor={Gdk.Cursor.new_from_name("pointer", null)} tooltipText={tooltipText}>
            <box spacing={5}>
                <Gtk.EventControllerMotion onEnter={() => playHoverSound()} />
                {onRightClick && (<Gtk.GestureClick button={3} onPressed={() => onRightClick()} />)}
                {draggable && (<Gtk.GestureDrag onDragBegin={handleDragBegin} onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate} />)}
                {children}
                <label label={name} halign={Gtk.Align.START} />
                <box hexpand />
                {draggable && <image file={`${HOME_DIR}/.config/ags/assets/icon/ri--draggable.svg`} pixelSize={16} cursor={Gdk.Cursor.new_from_name("grab", null)} /> }
                {/* <image file={`${HOME_DIR}/.config/ags/assets/decoration.svg`} pixelSize={16}/> */}
            </box>
        </button>
    )
}
