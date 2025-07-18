/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */

import type * as React from "react";
import * as ReactJsx from "react/jsx-runtime";

export type NestedCssStyles = React.CSSProperties & {
  [K: `&${string}` | `@${string}`]: NestedCssStyles;
};

export namespace JSX {
  export type ElementType = React.JSX.ElementType;
  export interface Element extends React.JSX.Element {}
  export interface ElementClass extends React.JSX.ElementClass {}
  export interface ElementAttributesProperty
    extends React.JSX.ElementAttributesProperty {}
  export interface ElementChildrenAttribute
    extends React.JSX.ElementChildrenAttribute {}
  export type LibraryManagedAttributes<C, P> =
    React.JSX.LibraryManagedAttributes<C, P>;
  export interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
  export interface IntrinsicClassAttributes<T>
    extends React.JSX.IntrinsicClassAttributes<T> {}
  export type IntrinsicElements = {
    [K in keyof React.JSX.IntrinsicElements]: React.JSX.IntrinsicElements[K] & {
      css?: NestedCssStyles;
    };
  };
}

export type ElementType<
  P = any,
  Tag extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements
> =
  | { [K in Tag]: P extends JSX.IntrinsicElements[K] ? K : never }[Tag]
  | React.ComponentType<P>;

function processProps(props?: unknown): unknown {
  return props;
}

export function jsx(type: React.ElementType, props: unknown, key?: React.Key) {
  return ReactJsx.jsx(type, processProps(props), key);
}

export function jsxs(type: React.ElementType, props: unknown, key?: React.Key) {
  return ReactJsx.jsxs(type, processProps(props), key);
}

export const Fragment = ReactJsx.Fragment;
