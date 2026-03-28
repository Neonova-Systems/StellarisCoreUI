import { Accessor, With } from "ags";

/**
 * Props for {@link CreateValueWatcher}.
 *
 * @template T Value type emitted by the accessor or provided directly.
 */
type ValueWatcherProps<T> = {
    /**
     * Source value to render.
     *
     * Accepts either a reactive AGS accessor or a plain static value.
     */
    value: T | Accessor<T>;

    /**
     * Optional element rendered when the current value is null or undefined.
     *
     * Defaults to an empty box when not provided.
     */
    fallback?: JSX.Element;

    /**
     * Render callback invoked for non-nullish values.
     */
    children: (value: NonNullable<T>) => JSX.Element;
};

/**
 * Reactive value wrapper with null-safe fallback rendering.
 *
 * This helper extends AGS {@link With} by supporting:
 * - both static and accessor values,
 * - optional fallback UI when the value is null or undefined.
 *
 * @template T Value type emitted by the accessor or provided directly.
 * @param props Component props.
 * @param props.value Static value or reactive accessor to watch.
 * @param props.fallback Element shown when the current value is nullish.
 * @param props.children Render function for non-nullish values.
 * @returns JSX element that updates reactively for accessor values.
 */
export default function CreateValueWatcher<T>({ value, fallback, children }: ValueWatcherProps<T>) {
    /**
     * Converts a current value into a renderable element.
     */
    function renderValue(currentValue: T): JSX.Element {
        if (currentValue === null || currentValue === undefined) {
            return fallback ?? <box />;
        }
        return children(currentValue as NonNullable<T>);
    }

    if (typeof value === "function") {
        const accessor = value as Accessor<T>;
        return (
            <box>
                <With value={accessor}>
                    {(v) => renderValue(v)}
                </With>
            </box>
        );
    }

    return (
        renderValue(value)
    );
}