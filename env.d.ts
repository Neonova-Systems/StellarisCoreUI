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

// AGS accessor type — matches the real AGS runtime API where accessors
// are objects with peek/set/subscribe, not plain functions.
interface Accessor<T> {
  peek(): T
  set(value: T): void
  subscribe(callback: (value: T) => void): () => void
  get(): T
}

// JSX namespace for AGS/gtk4 elements
declare namespace JSX {
  interface IntrinsicElements {
    [key: string]: any
  }
  interface Element {
    type: any
    props: any
  }
  function h(type: any, props: any, ...children: any[]): Element
  function cloneElement(element: Element, props: any, ...children: any[]): Element
  function isValidElement(element: any): boolean
  function Fragment(props: any, ...children: any[]): Element
}

declare module "ags" {
  export function createState<T>(initial: T): [Accessor<T>, (value: T) => void]
  export function createBinding<T>(object: any, property: string): Accessor<T>
  export class With<T> {
    constructor(value: Accessor<T> | T)
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