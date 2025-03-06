import {
  MixedSchemaData,
  SchemaConfig,
  schemaConfigs,
  SchemaData,
} from "@elllphnt/elll-element";
import {
  combineLatestOrEmpty,
  Datafiable,
  Disposable,
  restoreReactiveArray,
  restoreReactiveMap,
  restoreReactiveObject,
} from "@repo/utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";

export class Schema extends Disposable implements Datafiable<MixedSchemaData> {
  private _type$ = new BehaviorSubject<string>("");
  private _items$ = new BehaviorSubject<Schema[]>([]);
  private _item$ = new BehaviorSubject<Schema | undefined>(undefined);
  private _properties$ = new BehaviorSubject<Record<string, Schema>>({});
  private _parameters$ = new BehaviorSubject<Schema[]>([]);
  private _output$ = new BehaviorSubject<Schema | undefined>(undefined);

  get config() {
    return (schemaConfigs as any)[this.type] as SchemaConfig | undefined;
  }

  get type() {
    return this._type$.value;
  }
  get type$() {
    return this._type$.asObservable();
  }

  get items() {
    return this._items$.value;
  }
  get items$() {
    return this._items$.asObservable();
  }

  get item() {
    return this._item$.value;
  }
  get item$() {
    return this._item$.asObservable();
  }

  get properties() {
    return this._properties$.value;
  }
  get properties$() {
    return this._properties$.asObservable();
  }

  get parameters() {
    return this._parameters$.value;
  }
  get parameters$() {
    return this._parameters$.asObservable();
  }

  get output() {
    return this._output$.value;
  }
  get output$() {
    return this._output$.asObservable();
  }

  private cleanUpData(data: MixedSchemaData): MixedSchemaData {
    if (data.items && data.items.length === 0) {
      delete data.items;
    }
    return data;
  }
  get data(): MixedSchemaData {
    return this.cleanUpData({
      type: this.type,
      items: this.items.map((item) => item.data),
      item: this.item ? this.item.data : undefined,
      properties: Object.fromEntries(
        Object.entries(this.properties).map(([key, schema]) => [
          key,
          schema.data,
        ]),
      ),
      parameters: this.parameters.map((parameter) => parameter.data),
      output: this.output?.data,
    });
  }
  get data$(): Observable<MixedSchemaData> {
    return combineLatest([
      this.type$,
      this.items$.pipe(
        switchMap((items) =>
          combineLatestOrEmpty(items.map((item) => item.data$)),
        ),
      ),
      this.item$.pipe(switchMap((item) => item?.data$ || of(undefined))),
      this.properties$.pipe(
        switchMap((properties) =>
          combineLatestOrEmpty(
            Object.entries(properties).map(([key, schema]) =>
              schema.data$.pipe(map((data) => [key, data])),
            ),
          ),
        ),
        map((entries) =>
          Object.fromEntries(entries.map(([key, data]) => [key, data])),
        ),
      ),
      this.parameters$.pipe(
        switchMap((parameters) =>
          combineLatestOrEmpty(parameters.map((parameter) => parameter.data$)),
        ),
      ),
      this.output$.pipe(switchMap((output) => output?.data$ || of(undefined))),
    ]).pipe(
      map(([type, items, item, properties, parameters, output]) => ({
        type,
        items,
        item,
        properties,
        parameters,
        output,
      })),
      map((data) => this.cleanUpData(data)),
    );
  }

  constructor() {
    super();
  }

  validate(object: any): { valid: boolean; errors: string[] } {
    if (!this.config) {
      return { valid: false, errors: [`Unknown schema type: ${this.type}`] };
    }

    return this.config.validate(this.data as SchemaData, object);
  }
  validate$(object: any): Observable<{ valid: boolean; errors: string[] }> {
    if (!this.config) {
      return of({
        valid: false,
        errors: [`Unknown schema type: ${this.type}`],
      });
    }

    const config = this.config;
    return this.data$.pipe(
      map((data) => config.validate(data as SchemaData, object)),
    );
  }

  match(schema: Schema): boolean {
    if (!this.config) {
      return false;
    }

    return this.config.match(
      this.data as SchemaData,
      schema.data as SchemaData,
    );
  }
  match$(schema: Schema): Observable<boolean> {
    if (!this.config) {
      return of(false);
    }

    const config = this.config;
    return schema.data$.pipe(
      map((data) => config.match(this.data as SchemaData, data as SchemaData)),
    );
  }

  setType(type: string) {
    this._type$.next(type);
  }

  addItem(schema: Schema) {
    this._items$.next([...this.items, schema]);
  }
  removeItem(index: number) {
    this._items$.next([
      ...this.items.slice(0, index),
      ...this.items.slice(index + 1),
    ]);
  }
  insertItem(index: number, schema: Schema) {
    this._items$.next([
      ...this.items.slice(0, index),
      schema,
      ...this.items.slice(index),
    ]);
  }

  setItem(schema: Schema | undefined) {
    this._item$.next(schema);
  }

  setProperty(key: string, schema: Schema) {
    this._properties$.next({
      ...this.properties,
      [key]: schema,
    });
  }
  removeProperty(key: string) {
    const { [key]: _, ...properties } = this.properties;
    this._properties$.next(properties);
  }

  addParameter(schema: Schema) {
    this._parameters$.next([...this.parameters, schema]);
  }
  removeParameter(index: number) {
    this._parameters$.next([
      ...this.parameters.slice(0, index),
      ...this.parameters.slice(index + 1),
    ]);
  }
  insertParameter(index: number, schema: Schema) {
    this._parameters$.next([
      ...this.parameters.slice(0, index),
      schema,
      ...this.parameters.slice(index),
    ]);
  }

  restore(data: MixedSchemaData): void {
    this._type$.next(data.type);

    restoreReactiveArray({
      datafiables$: this._items$,
      data: data.items,
      create: (data) => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
      identifyData: (data) => data.type,
      identifyDatafiable: (schema) => schema.data.type,
    });

    restoreReactiveObject({
      datafiable$: this._item$,
      data: data.item,
      create: (data) => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
      identifyData: (data) => data.type,
      identifyDatafiable: (schema) => schema.data.type,
    });

    restoreReactiveMap({
      datafiable$: this._properties$,
      data: data.properties,
      create: (data) => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
    });

    restoreReactiveArray({
      datafiables$: this._parameters$,
      data: data.parameters,
      create: (data) => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
      identifyData: (data) => data.type,
      identifyDatafiable: (schema) => schema.data.type,
    });

    restoreReactiveObject({
      datafiable$: this._output$,
      data: data.output,
      create: (data) => new Schema(),
      restore: (schema, data) => schema.restore(data),
      dispose: (schema) => schema.dispose(),
      identifyData: (data) => data.type,
      identifyDatafiable: (schema) => schema.data.type,
    });
  }
}
