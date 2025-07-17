/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */

import { Link } from "@tanstack/react-router";
import type * as React from "react";
import * as ReactJsx from "react/jsx-runtime";

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
  export interface IntrinsicElements extends React.JSX.IntrinsicElements {
    navlink: React.JSX.IntrinsicElements["a"] & {
      to?: string; // Allow `to` prop for navigation links
      href?: string; // Allow `href` prop for compatibility
    };
  }
}

export type ElementType<
  P = any,
  Tag extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements
> =
  | { [K in Tag]: P extends JSX.IntrinsicElements[K] ? K : never }[Tag]
  | React.ComponentType<P>;

function transformNavlink(
  props: any = {},
  key?: React.Key
): [type: React.ElementType, props: unknown, key?: React.Key] {
  return [
    Link,
    {
      ...props,
      to: props.to || props.href, // Support both `to` and `href` for compatibility
    },
    key,
  ];
}

function transformElement(
  type: ElementType,
  props: unknown,
  key?: React.Key
): [type: React.ElementType, props: unknown, key?: React.Key] {
  switch (type) {
    case "navlink":
      return transformNavlink(props, key);
    default:
      return [type, props, key];
  }
}

export function jsx(type: React.ElementType, props: unknown, key?: React.Key) {
  return ReactJsx.jsx(...transformElement(type, props, key));
}

export function jsxs(type: React.ElementType, props: unknown, key?: React.Key) {
  return ReactJsx.jsxs(...transformElement(type, props, key));
}

export const Fragment = ReactJsx.Fragment;
