
import { execAsync } from "ags/process";

/**
 * Any AGS state setter that accepts a string value.
 */
type Setter = (value: string) => void;

/**
 * Maps each shell command to the setter that should receive its output.
 */
type CommandSetterTable = Record<string, Setter>;

/**
 * Optional behavior overrides for {@link createBindingCommandTableSetter}.
 */
type CreateBindingCommandTableSetterOptions = {
	/**
	 * Wrap each command with `dash -c` before execution.
	 *
	 * Defaults to `true`.
	 */
	useDashShell?: boolean;

	/**
	 * Shared transform applied to every command output.
	 *
	 * @param value Raw command output.
	 * @param command Command being processed.
	 * @returns Value passed to the matched setter.
	 */
	transform?: (value: string, command: string) => string;

	/**
	 * Optional error hook called when a command fails.
	 *
	 * If omitted, the helper logs to {@link console.error}.
	 */
	onError?: (command: string, error: unknown) => void;
};

/**
 * Executes a command-to-setter table.
 *
 * This helper is designed for table-driven state assignment patterns where
 * many values are populated from `execAsync` results.
 *
 * Behavior summary:
 * - Iterates all entries in `commandSetterTable`.
 * - Runs commands with `dash -c` by default.
 * - Applies `transform` to each command output when provided.
 * - Uses `value.trim()` as the default transform when no transform is provided.
 * - Calls `onError` for failures, or logs by default.
 *
 * @param commandSetterTable Map of command -> setter.
 * @param options Optional transform and error-handling behavior.
 * @returns Nothing. Work is performed asynchronously per command.
 *
 * @example
 * ```ts
 * createBindingCommandTableSetter(
 *   {
 *     [`${batteryPath} | grep 'state' | cut -d: -f2`]: setState,
 *     [`${batteryPath} | grep 'voltage:' | cut -d: -f2`]: setVoltage,
 *   },
 *   {
 *     transform: (out) => out.trim().toUpperCase(),
 *   },
 * );
 * ```
 */
export default function createBindingCommandTableSetter( commandSetterTable: CommandSetterTable, options: CreateBindingCommandTableSetterOptions = {},): void {
	const useDashShell = options.useDashShell ?? true;

	// Default output cleanup when no transform is provided.
	const defaultTransform = options.transform ?? ((value: string) => value.trim());

	// Iterate command -> setter entries and route each result to its setter.
	Object.entries(commandSetterTable).forEach(([command, setter]) => {
		const resolvedCommand = useDashShell
			? `dash -c "${command.replace(/(["\\$`])/g, "\\$1")}"`
			: command;

		execAsync(resolvedCommand)
			.then((output) => { setter(defaultTransform(output, command)); })
			.catch((error) => {
				// Let callers override error handling when they need custom behavior.
				if (options.onError) {
					options.onError(command, error);
					return;
				}
				console.error(`Failed to execute command: ${command}`, error);
			});
	});
}