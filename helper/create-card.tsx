import { Accessor, With } from "ags";
import { Gtk } from "ags/gtk4";

/**
 * Props for {@link CreateCard}.
 */
type CardProps = {
    /**
     * Header or always-visible content, typically a panel/title row.
     */
    children?: JSX.Element | JSX.Element[];
    /**
     * Main card body to show when {@link CardProps.state} is true.
     * This prop is required.
     */
    cardContent: JSX.Element | JSX.Element[];
    /**
     * Visibility accessor used to toggle the card body.
     * This prop is required.
     */
    state: Accessor<boolean>;
}

/**
 * A layout-stable placeholder used when card content is hidden.
 *
 * @returns A non-visible box element.
 */
function HiddenBox() {
    return <box visible={false} vexpand={false} hexpand={false} />;
}

/**
 * Normalizes card content into a single JSX element.
 *
 * AGS `With` callbacks should return a renderable element value.
 * Arrays are wrapped in a vertical box to keep return types consistent.
 *
 * @param content Content as a single element or element array.
 * @returns A single JSX element that can be rendered safely.
 */
function asElement(content?: JSX.Element | JSX.Element[]): JSX.Element {
    if (!content) return <HiddenBox />;
    if (Array.isArray(content)) {
        return <box orientation={Gtk.Orientation.VERTICAL}>{content}</box>;
    }
    return content;
}

/**
 * Reusable card wrapper with reactive body visibility.
 *
 * Behavior:
 * - Always renders {@link CardProps.children}.
 * - Uses {@link CardProps.state} with `With` to show/hide {@link CardProps.cardContent}.
 *
 * @param props Card layout and visibility props.
 * @returns A card component container.
 */
export default function CreateCard({ children, state, cardContent }: CardProps) {
    const normalizedCardContent = asElement(cardContent);

    /**
        * Renders card content with reactive state gating.
     */
    function renderWithComponent() {
        if (!state) return normalizedCardContent;

        return (
            <With value={state}>
                {(v) => (v ? normalizedCardContent : <HiddenBox />)}
            </With>
        )
    }

    return (
        <box cssClasses={["card"]} orientation={Gtk.Orientation.VERTICAL} vexpand={false}>
            {children}
            {renderWithComponent()}
        </box>
    );
}