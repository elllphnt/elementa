import {
  BehaviorSubject,
  Observable,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from "rxjs";
import { ListSchema, ObjectSchema, Schema, SchemaValue } from "./schema";
import { combineLatestOrEmpty } from "./rxjs";

export abstract class Derivable<T> {
  // used by the parent to keep track of the derivable
  private _ref$ = new BehaviorSubject<any>(undefined);
  get ref() {
    return this._ref$.value;
  }
  get ref$() {
    return this._ref$.asObservable();
  }
  set ref(value) {
    this._ref$.next(value);
  }

  readonly parent: Derivable<any> | undefined;

  abstract baseOf<U>(derivable: Derivable<U>): Derivable<U> | undefined;
  abstract baseOf$<U>(
    derivable: Derivable<U>,
  ): Observable<Derivable<U> | undefined>;

  get base$() {
    return this.parent?.baseOf$(this) ?? of(undefined);
  }
  get base() {
    return this.parent?.baseOf(this);
  }

  abstract ownValue: T | undefined;
  abstract ownValue$: Observable<T | undefined>;

  get value(): T | undefined {
    return this.ownValue ?? this.base?.value;
  }
  get value$(): Observable<T | undefined> {
    return combineLatestOrEmpty([
      this.ownValue$,
      this.base$.pipe(switchMap((base) => base?.value$ ?? of(undefined))),
    ]).pipe(map(([ownValue, baseValue]) => ownValue ?? baseValue));
  }

  constructor({ parent }: { parent?: Derivable<any> } = {}) {
    this.parent = parent;
  }

  abstract setValue(value: T | undefined): void;
  abstract update(data: any): void;
}

export class PrimitiveDerivable<
  T extends string | number | boolean,
> extends Derivable<T> {
  private _value$ = new BehaviorSubject<T | undefined>(undefined);

  baseOf() {
    return undefined;
  }
  baseOf$() {
    return of(undefined);
  }

  get ownValue() {
    return this._value$.value;
  }
  get ownValue$() {
    return this._value$.asObservable().pipe(distinctUntilChanged());
  }

  get value() {
    return this.ownValue ?? this.base?.value;
  }
  setValue(value: T | undefined) {
    this._value$.next(value);
  }
  update(data: any) {
    this.setValue(data);
  }
}

export class ObjectDerivable<S extends ObjectSchema> extends Derivable<
  SchemaValue<S>
> {
  private _properties: {
    [K in keyof S["properties"]]: Derivable<SchemaValue<S["properties"][K]>>;
  };

  baseOf<U>(derivable: Derivable<U>): Derivable<U> | undefined {
    return (this.base as ObjectDerivable<S> | undefined)?.property(
      derivable.ref,
    ) as Derivable<U> | undefined;
  }
  baseOf$<U>(derivable: Derivable<U>): Observable<Derivable<U> | undefined> {
    return this.base$.pipe(
      map((base) => {
        return (base as ObjectDerivable<S> | undefined)?.property(
          derivable.ref,
        ) as Derivable<U> | undefined;
      }),
    );
  }

  get ownValue(): SchemaValue<S> {
    const value: SchemaValue<S> = {} as any;
    for (const key in this._properties) {
      (value as any)[key] = this._properties[key].ownValue;
    }
    return value;
  }
  get ownValue$(): Observable<SchemaValue<S>> {
    const ownValue$s: Observable<any>[] = [];
    const keys: string[] = [];
    for (const key in this._properties) {
      keys.push(key);
      ownValue$s.push(this._properties[key].ownValue$);
    }
    return combineLatestOrEmpty(ownValue$s).pipe(
      map((values) => {
        return Object.fromEntries(
          keys.map((key, i) => [key, values[i]]),
        ) as SchemaValue<S>;
      }),
    );
  }

  get value(): SchemaValue<S> {
    const value: SchemaValue<S> = {} as any;
    for (const key in this._properties) {
      (value as any)[key] = this._properties[key].value;
    }
    return value;
  }
  get value$(): Observable<SchemaValue<S>> {
    const value$s: Observable<any>[] = [];
    const keys: string[] = [];
    for (const key in this._properties) {
      keys.push(key);
      value$s.push(this._properties[key].value$);
    }
    return combineLatestOrEmpty(value$s).pipe(
      map((values) => {
        return Object.fromEntries(
          keys.map((key, i) => [key, values[i]]),
        ) as SchemaValue<S>;
      }),
    );
  }

  property<K extends keyof S["properties"]>(
    key: K,
  ): Derivable<SchemaValue<S["properties"][K]>> {
    return this._properties[key];
  }

  constructor({ schema, parent }: { schema: S; parent?: Derivable<any> }) {
    super();
    this._properties = {} as any;

    for (const key in schema.properties) {
      const derivable = makeDerivable({
        schema: schema.properties[key],
        parent,
      });
      derivable.ref = key;
      (this._properties as any)[key] = derivable;
    }
  }

  setValue(value: SchemaValue<S>) {
    for (const key in this._properties) {
      this._properties[key]?.setValue(value?.[key] as any);
    }
  }
  update(data: any): void {
    for (const key in data) {
      this._properties[key]?.update(data[key]);
    }
  }
}

export class ListDerivable<S extends ListSchema> extends Derivable<
  SchemaValue<S>
> {
  readonly schema: S;
  private _items$ = new BehaviorSubject<Derivable<SchemaValue<S["items"]>>[]>(
    [],
  );

  baseOf<U>(derivable: Derivable<U>): Derivable<U> | undefined {
    return (this.base as ListDerivable<S> | undefined)?.item(derivable.ref) as
      | Derivable<U>
      | undefined;
  }
  baseOf$<U>(derivable: Derivable<U>): Observable<Derivable<U> | undefined> {
    return combineLatestOrEmpty([
      this.base$,
      derivable.ref$.pipe(distinctUntilChanged()),
    ]).pipe(
      map(([base, ref]) => {
        return (base as ListDerivable<S> | undefined)?.item(ref) as
          | Derivable<U>
          | undefined;
      }),
    );
  }

  item(ref: number) {
    return this._items$.value[ref];
  }

  get ownValue(): SchemaValue<S> {
    return this._items$.value.map((item) => item.ownValue) as SchemaValue<S>;
  }
  get ownValue$(): Observable<SchemaValue<S>> {
    return this._items$.asObservable().pipe(
      switchMap((items) =>
        combineLatestOrEmpty(items.map((item) => item.ownValue$)),
      ),
      map((values) => values as SchemaValue<S>),
    );
  }

  get value(): SchemaValue<S> {
    return this._items$.value.map((item) => item.value) as SchemaValue<S>;
  }
  get value$(): Observable<SchemaValue<S>> {
    return this._items$.asObservable().pipe(
      switchMap((items) =>
        combineLatestOrEmpty(items.map((item) => item.value$)),
      ),
      map((values) => values as SchemaValue<S>),
    );
  }

  constructor({ schema, parent }: { schema: S; parent?: Derivable<any> }) {
    super({ parent });
    this.schema = schema;
  }

  setValue(value: SchemaValue<S>) {
    if (!Array.isArray(value)) {
      console.error(
        "Invalid value for ListDerivable:",
        value,
        "expected an array of values.",
      );
      return;
    }

    const newItems = value.map((item, i) => {
      const derivable = makeDerivable({
        schema: this.schema.items,
        parent: this,
      }) as Derivable<SchemaValue<S["items"]>>;
      derivable.ref = i;
      derivable.setValue(item as any);
      return derivable;
    });

    this._items$.next(newItems);
  }
  update(data: any): void {
    const newItems = [...this._items$.value] as (
      | Derivable<SchemaValue<S["items"]>>
      | undefined
    )[];
    for (const key in data) {
      const itemData = (data as any)[key];
      const item = newItems[key as any];
      if (itemData === undefined) {
        newItems[key as any] = undefined;
      } else {
        if (item === undefined) {
          newItems[key as any] = makeDerivable({
            schema: this.schema.items,
            parent: this,
          }) as Derivable<SchemaValue<S["items"]>>;
          newItems[key as any]?.update(itemData);
        } else {
          item.update(itemData);
        }
      }
    }
    this._items$.next(
      newItems.filter(Boolean) as Derivable<SchemaValue<S["items"]>>[],
    );
  }
}

export function makeDerivable<S extends Schema>({
  schema,
  parent,
}: {
  schema: S;
  parent?: Derivable<any>;
}) {
  if (schema === "string") {
    return new PrimitiveDerivable<string>({ parent });
  } else if (schema === "number") {
    return new PrimitiveDerivable<number>({ parent });
  } else if (schema === "boolean") {
    return new PrimitiveDerivable<boolean>({ parent });
  } else if (schema.type === "object") {
    return new ObjectDerivable({ schema, parent });
  } else if (schema.type === "list") {
    return new ListDerivable({ schema, parent });
  } else {
    throw new Error(`Invalid schema: Unsupported schema type ${schema}`);
  }
}
