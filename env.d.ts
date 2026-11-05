declare const SRC: string

declare module "inline:*" {
  const content: string
  export default content
}

declare module "*.scss" {
  const content: string
  export default content
}

declare module "*.blp" {
  const content: string
  export default content
}

declare module "*.css" {
  const content: string
  export default content
}

// AGS core modules
declare module "ags" {
  export function createState<T>(initial: T): [() => T, (value: T) => void]
  export function createBinding<T>(object: any, property: string): () => T
  export class With<T> {
    constructor(value: T)
    render(children: (value: T) => JSX.Element): JSX.Element
  }
}

declare module "ags/gtk4" {
  export const Gtk: any
  export const Gdk: any
}

declare module "ags/gtk4/app" {
  const app: any
  export default app
}

declare module "ags/process" {
  export function execAsync(command: string): Promise<string>
}

declare module "ags/file" {
  export function readFile(path: string): string
  export function writeFile(path: string, content: string): void
}

declare module "ags/time" {
  export function interval(ms: number, callback: () => void): any
  export function timeout(ms: number, callback: () => void): any
}

// JSON is standard JavaScript, available in GJS/AGS runtime
declare const JSON: {
  parse(text: string): any
  stringify(value: any): string
}