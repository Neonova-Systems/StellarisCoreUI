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
  // AGS accessor — matches the real AGS runtime API where accessors
  // are objects with peek/set/subscribe, not plain functions.
  export class Accessor<T> {
    peek(): T
    set(value: T): void
    subscribe(callback: (value: T) => void): () => void
    get(): T
    constructor(get: () => T, subscribe?: (callback: () => void) => () => void)
  }

  export function createState<T>(initial: T): [Accessor<T>, (value: T) => void]
  export function createBinding<T>(object: any, property: string): Accessor<T>
  export class With<T> {
    constructor(value: Accessor<T> | T)
    render(children: (value: T) => JSX.Element): JSX.Element
  }
  export class For<T> {
    constructor(props: { each: Accessor<T[]>; children: (item: T, index: number) => JSX.Element })
  }
}

declare module "ags/gtk4" {
  export const Gtk: any
  export const Gdk: any
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

// Gtk namespace for type references like Gtk.Box, Gtk.Orientation, Gtk.GestureDrag
declare namespace Gtk {
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

// JSON is standard JavaScript, available in GJS/AGS runtime
declare const JSON: {
  parse(text: string): any
  stringify(value: any): string
}