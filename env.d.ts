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
  export function createState<T>(initial: T): [Accessor<T>, (value: T) => void]
  export function createBinding<T>(object: any, property: string): Accessor<T>
  export class With<T> {
    constructor(value: Accessor<T> | T)
    render(children: (value: T) => JSX.Element): JSX.Element
  }
  export class For<T> {
    constructor(props: { each: Accessor<T[]>; children: (item: T, index: number) => JSX.Element })
  }
  export type Accessor<T> = {
    (transform: (value: T) => any): Accessor<any>
    peek(): T
    set(value: T): void
    subscribe(callback: (value: T) => void): () => void
    get(): T
  }
}

declare module "ags/gtk4" {
  export const Gtk: any
  export const Gdk: any

  export namespace Gtk {
    type Box = any
    type Orientation = any
    type GestureDrag = any
    type DrawingArea = any
    type Overlay = any
    type Label = any
    type Image = any
    type Button = any
    type Widget = any
    type Align = any
    type CairoContext = any
    type Picture = any
    type ContentFit = any
    type EventController = any
    type EventControllerMotion = any
    type EventControllerKey = any
    type IconTheme = any
    type Allocation = any
    type Window = any
    type Application = any
    type ApplicationWindow = any
    type Revealer = any
    type Spinner = any
    type Switch = any
    type Scale = any
    type LevelBar = any
    type ProgressBar = any
    type Popover = any
    type MenuButton = any
    type ToggleButton = any
    type CheckButton = any
    type RadioButton = any
    type ComboBox = any
    type Entry = any
    type SearchEntry = any
    type TextBuffer = any
    type TextView = any
    type ScrolledWindow = any
    type Grid = any
    type FlowBox = any
    type Separator = any
  }

  export namespace Gdk {
    type Cursor = any
    type Rectangle = any
    type RGBA = any
    type EventMotion = any
    type EventButton = any
    type EventKey = any
    type ScrollEvent = any
    type Monitor = any
    type Display = any
    type Clipboard = any
    type ContentProvider = any
    type ModifierType = any
    const KEY_Escape: number
    const KEY_Return: number
    const KEY_KP_Enter: number
    const KEY_space: number
    function keyval_to_lower(keyval: number): number
  }
}

declare module "ags/gtk4/jsx-runtime" {
  export function jsx(type: any, props: any, ...children: any[]): any
  export function jsxs(type: any, props: any, ...children: any[]): any
  export function Fragment(props: any, ...children: any[]): any
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



// JSX namespace for AGS/gtk4 elements
declare namespace JSX {
  interface IntrinsicElements {
    [key: string]: any
  }
  interface Element {
    type: any
    props: any
  }
  interface ElementChildrenAttribute {
    children: {}
  }
  function h(type: any, props: any, ...children: any[]): Element
  function cloneElement(element: Element, props: any, ...children: any[]): Element
  function isValidElement(element: any): boolean
  function Fragment(props: any, ...children: any[]): Element
}

// JSON is standard JavaScript, available in GJS/AGS runtime
declare const JSON: {
  parse(text: string): any
  stringify(value: any): string
}