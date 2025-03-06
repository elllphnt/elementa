import {
  ElementConnectionData,
  Expression,
  isExpression,
} from "@elllphnt/elll-element";
import { combineLatestOrEmpty, Disposable, pairwiseOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, of } from "rxjs";
import { Datafiable } from "~/src/_lib/restore";
import {
  ComponentElement,
  ContainerElement,
  MediaElement,
  TextElement,
  VectorElement,
} from "../_";
import { Element } from "../element";

export const elementConnectionTypes = {
  link: "link",
  style: "style",
  interaction: "interaction",
  container: {
    content: "container.content",
  },
  text: {
    content: "text.content",
  },
  media: {
    content: "media.content",
  },
  vector: {
    content: "vector.content",
  },
  component: {
    props: "component.props",
  },
};

export const elementConnections: Record<
  string,
  ElementConnectionConfig<any>
> = {
  // Element

  [elementConnectionTypes.link]: {
    value: (element) => element.link,
    value$: (element) => element.link$,
    setValue: (element, value) => element.setLink(value),
  } as ElementConnectionConfig,
  [elementConnectionTypes.interaction]: {
    value: (element, { event }) =>
      event ? element.interaction(event) : undefined,
    value$: (element, { event }) =>
      event ? element.interaction$(event) : of(undefined),
    setValue: (element, value, { event }) => {
      if (!event) {
        return;
      }
      element.setInteraction(event, value);
    },
  } as ElementConnectionConfig<
    Element,
    {
      event?: string;
    }
  >,

  // Container

  [elementConnectionTypes.container.content]: {
    value: (element) => element.contentExpression,
    value$: (element) => element.contentExpression$,
    setValue: (element, value) => element.setContentExpression(value),
  } as ElementConnectionConfig<ContainerElement>,

  // Text

  [elementConnectionTypes.text.content]: {
    value: (element) => element.content,
    value$: (element) => element.content$,
    setValue: (element, value) => element.setContent(value),
  } as ElementConnectionConfig<TextElement>,

  // Media

  [elementConnectionTypes.media.content]: {
    value: (element) => element.content,
    value$: (element) => element.content$,
    setValue: (element, value) => element.setContent(value),
  } as ElementConnectionConfig<MediaElement>,

  // Vector

  [elementConnectionTypes.vector.content]: {
    value: (element) => element.content,
    value$: (element) => element.content$,
    setValue: (element, value) => element.setContent(value),
  } as ElementConnectionConfig<VectorElement>,

  // Component

  [elementConnectionTypes.component.props]: {
    value: (element, { prop }) => (prop ? element.prop(prop) : undefined),
    value$: (element, { prop }) => (prop ? element.prop$(prop) : of(undefined)),
    setValue: (element, value, { prop }) => {
      if (!prop) {
        return;
      }
      element.setProp(prop, value);
    },
  } as ElementConnectionConfig<
    ComponentElement,
    {
      prop?: string;
    }
  >,
};

export type ElementConnectionConfig<
  E extends Element = Element,
  S extends Record<string, any> = Record<string, any>,
> = {
  value: (element: E, settings: S) => any;
  value$: (element: E, settings: S) => Observable<any>;
  setValue: (element: E, value: any, settings: S) => void;
};

export class ElementConnection
  extends Disposable
  implements Datafiable<ElementConnectionData>
{
  readonly key: string;
  readonly element: Element;

  private _type$ = new BehaviorSubject<string | undefined>(undefined);
  private _source$ = new BehaviorSubject<Expression | undefined>(undefined);
  private _settings$ = new BehaviorSubject<Record<string, any>>({});

  get type$() {
    return this._type$.asObservable();
  }
  get type() {
    return this._type$.getValue();
  }

  get source$() {
    return this._source$.asObservable();
  }
  get source() {
    return this._source$.getValue();
  }

  get settings$() {
    return this._settings$.asObservable();
  }
  get settings() {
    return this._settings$.getValue();
  }

  setting(key: string) {
    return this.settings[key];
  }
  setting$(key: string) {
    return this.settings$.pipe(map((settings) => settings[key]));
  }

  get config(): ElementConnectionConfig | undefined {
    return this.type ? elementConnections[this.type] : undefined;
  }
  get config$(): Observable<ElementConnectionConfig | undefined> {
    return this.type$.pipe(
      map((type) => (type ? elementConnections[type] : undefined)),
    );
  }

  get data(): ElementConnectionData {
    return {
      key: this.key,
      type: this.type,
      source: this.source,
      settings: this.settings,
    };
  }
  get data$(): Observable<ElementConnectionData> {
    return combineLatestOrEmpty([
      this.type$,
      this.source$,
      this.settings$,
    ]).pipe(
      map(([type, source, settings]) => ({
        key: this.key,
        type,
        source,
        settings,
      })),
    );
  }

  constructor({ key, element }: { key?: string; element: Element }) {
    super();
    this.key = key ?? Math.random().toString(36).substring(7);
    this.element = element;

    const setterSubscription = combineLatestOrEmpty([
      this.config$,
      this.source$,
      this.settings$,
    ])
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        if (prev) {
          // clear previous settings
          const [config, , settings] = prev;
          if (config) {
            const value = config.value(this as any, settings);
            if (isExpression(value)) {
              config.setValue(this.element, value.fallback, settings);
            }
          }
        }

        if (next) {
          const [config, source, settings] = next;
          if (config) {
            config.setValue(this.element, source, settings);
          }
        }
      });

    this.addDisposer(() => {
      this._type$.complete();
      this._source$.complete();
      this._settings$.complete();

      setterSubscription.unsubscribe();
    });
  }

  setSource(source: Expression | undefined) {
    this._source$.next(source);
  }

  setType(type: string | undefined) {
    this._type$.next(type);
  }

  setSetting(key: string, value: any) {
    this._settings$.next({ ...this.settings, [key]: value });
  }

  restore(data: ElementConnectionData) {
    this._type$.next(data.type);
    this._source$.next(data.source);
  }
}
