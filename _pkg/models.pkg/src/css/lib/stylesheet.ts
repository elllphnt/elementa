import { Disposable } from "@repo/utils";

/**
 * Represents a single CSS stylesheet.
 * A CssStyleSheet most of the time represents a single entity in the system
 * that needs some styles to be available in the DOM.
 *
 * {target} is for debugging purposes and should be used to identify the
 * the resource that this stylesheet is associated with.
 *
 * Is expected to be extended by other classes that provide more specific
 * implementations of how the styles are created and managed.
 *
 * @abstract
 * @extends {Disposable}
 */
export abstract class CssStyleSheet extends Disposable {
  readonly type: string;

  abstract get target(): string;

  constructor({ type }: { type: string }) {
    super();
    this.type = type;
  }
}
