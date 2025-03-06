import { init } from "@paralleldrive/cuid2";
import {
  combineLatestOrEmpty,
  Datafiable,
  Disposable,
  restoreReactiveMap,
} from "@repo/utils";
import _ from "lodash";
import { BehaviorSubject, map, switchMap } from "rxjs";
import { SpecData } from "./_types";
import { Domain } from "./domain";
import { Feature } from "./feature";

export class Spec extends Disposable implements Datafiable<SpecData> {
  static generateId = init({
    length: 7,
  });
  static defaultDomainKey = "__default__";

  private _state$ = new BehaviorSubject<Pick<SpecData, "type" | "description">>(
    {},
  );
  private _features$ = new BehaviorSubject<Record<string, Feature>>({});
  private _domains$ = new BehaviorSubject<Record<string, Domain>>({});
  private _featuresByDomain$ = new BehaviorSubject<Record<string, string[]>>(
    {},
  );

  get state$() {
    return this._state$.asObservable();
  }
  get state() {
    return this._state$.value;
  }

  get type$() {
    return this.state$.pipe(map((state) => state.type));
  }
  get type() {
    return this.state.type;
  }

  get description$() {
    return this.state$.pipe(map((state) => state.description));
  }
  get description() {
    return this.state.description;
  }

  get features$() {
    return this._features$.pipe(map((features) => Object.values(features)));
  }
  get features() {
    return Object.values(this._features$.value);
  }

  feature(featureId: string) {
    return this._features$.value[featureId] as Feature | undefined;
  }
  feature$(featureId: string) {
    return this._features$.pipe(
      map((fs) => fs[featureId] as Feature | undefined),
    );
  }

  get domains$() {
    return this._domains$.pipe(map((domains) => Object.values(domains)));
  }
  get domains() {
    return Object.values(this._domains$.value);
  }

  featuresByDomain(domainId?: string) {
    return (
      this._featuresByDomain$.value[domainId ?? Spec.defaultDomainKey] ?? []
    )
      .map((id) => this.feature(id))
      .filter(Boolean) as Feature[];
  }
  featuresByDomain$(domainId?: string) {
    return this._featuresByDomain$.pipe(
      map(
        (featuresByDomain) =>
          featuresByDomain[domainId ?? Spec.defaultDomainKey] ?? [],
      ),
      switchMap((ids) =>
        combineLatestOrEmpty(ids.map((id) => this.feature$(id))),
      ),
      map((fs) => fs.filter(Boolean) as Feature[]),
    );
  }

  get data() {
    return {
      type: this.type,
      description: this.description,
      features: this.features.map((feature) => feature.data),
      domains: this.domains.map((domain) => domain.data),
      featuresByDomain: this._featuresByDomain$.value,
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this.type$,
      this.description$,
      this.features$.pipe(
        switchMap((features) =>
          combineLatestOrEmpty(features.map((feature) => feature.data$)),
        ),
      ),
      this.domains$.pipe(
        switchMap((domains) =>
          combineLatestOrEmpty(domains.map((domain) => domain.data$)),
        ),
      ),
      this._featuresByDomain$,
    ]).pipe(
      map(([type, description, features, domains, featuresByDomain]) => ({
        type,
        description,
        features,
        domains,
        featuresByDomain,
      })),
    );
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._state$.complete();
      this._features$.complete();
      this._domains$.complete();
    });
  }

  setDescription(description: string): void {
    this._state$.next({
      ...this._state$.value,
      description,
    });
  }

  private _setFeaturesByDomain(data: Record<string, string[]>): void {
    let featureDomainMap: Record<string, string> = {};
    const unassignedFeatureIds = new Set(Object.keys(this._features$.value));
    for (let domainKey in data) {
      // ensure all domains exist
      if (
        domainKey !== Spec.defaultDomainKey &&
        !this._domains$.value[domainKey]
      ) {
        continue;
      }

      for (let featureId of data[domainKey]) {
        // ensure all features exist
        if (!this._features$.value[featureId]) {
          continue;
        }

        featureDomainMap[featureId] = domainKey;
        unassignedFeatureIds.delete(featureId);
      }
    }

    // assign unassigned features to default domain
    for (let featureId of unassignedFeatureIds) {
      featureDomainMap[featureId] = Spec.defaultDomainKey;
    }

    const featuresByDomain: Record<string, string[]> = {};
    for (let featureId in featureDomainMap) {
      const domainId = featureDomainMap[featureId];
      featuresByDomain[domainId] = [
        ...(featuresByDomain[domainId] ?? []),
        featureId,
      ];
    }

    this._featuresByDomain$.next(featuresByDomain);
  }

  update(update: Partial<Pick<SpecData, "type" | "description">>): void {
    this._state$.next({
      ...this._state$.value,
      ...update,
    });
  }
  setFeatures(features: Feature[]): void {
    this._features$.next(
      Object.fromEntries(features.map((feature) => [feature.id, feature])),
    );
  }
  setDomains(domains: Domain[]): void {
    this._domains$.next(
      Object.fromEntries(domains.map((domain) => [domain.id, domain])),
    );
  }

  addDomain(domain: Domain): void {
    this._domains$.next({
      ...this._domains$.value,
      [domain.id]: domain,
    });
  }
  addFeature(feature: Feature, domainId?: string): void {
    this._features$.next({
      ...this._features$.value,
      [feature.id]: feature,
    });

    const domainKey = domainId ?? Spec.defaultDomainKey;
    this._setFeaturesByDomain({
      ...this._featuresByDomain$.value,
      [domainKey]: _.uniq([
        ...(this._featuresByDomain$.value[domainKey] ?? []),
        feature.id,
      ]),
    });
  }
  removeDomain(domainId: string): void {
    const domains = { ...this._domains$.value };
    delete domains[domainId];
    this._domains$.next(domains);

    // move features to default domain
    const featuresByDomain = { ...this._featuresByDomain$.value };
    featuresByDomain[Spec.defaultDomainKey] = _.uniq([
      ...(featuresByDomain[Spec.defaultDomainKey] ?? []),
      ...(featuresByDomain[domainId] ?? []),
    ]);
    delete featuresByDomain[domainId];
  }
  removeFeature(featureId: string): void {
    const features = { ...this._features$.value };
    delete features[featureId];
    this._features$.next(features);
  }
  moveFeature(
    featureId: string,
    from: string | undefined,
    to: [string | undefined, number],
  ): void {
    const fromDomainKey = from ?? Spec.defaultDomainKey;
    const toDomainKey = to[0] ?? Spec.defaultDomainKey;

    if (fromDomainKey === toDomainKey) {
      const domainKey = fromDomainKey;
      let features = [
        ...(this._featuresByDomain$.value[domainKey] ?? []),
      ].filter((f) => f != featureId);
      features.splice(to[1], 0, featureId);

      this._setFeaturesByDomain({
        ...this._featuresByDomain$.value,
        [domainKey]: features,
      });
    } else {
      let fromFeatures = [
        ...(this._featuresByDomain$.value[fromDomainKey] ?? []),
      ];
      let toFeatures = [...(this._featuresByDomain$.value[toDomainKey] ?? [])];

      fromFeatures = fromFeatures.filter((f) => f != featureId);
      toFeatures.splice(to[1], 0, featureId);

      this._setFeaturesByDomain({
        ...this._featuresByDomain$.value,
        [fromDomainKey]: fromFeatures,
        [toDomainKey]: toFeatures,
      });
    }
  }

  restore(data: SpecData): void {
    this._state$.next({
      type: data.type,
      description: data.description,
    });
    restoreReactiveMap({
      datafiable$: this._features$,
      data: Object.fromEntries(
        data.features?.map((feature) => [feature.id, feature]) ?? [],
      ),
      create: (feature) => new Feature(feature),
      restore: (feature, data) => feature.restore(data),
      dispose: (feature) => feature.dispose(),
    });
    restoreReactiveMap({
      datafiable$: this._domains$,
      data: Object.fromEntries(
        data.domains?.map((domain) => [domain.id, domain]) ?? [],
      ),
      create: (domain) => new Domain(domain),
      restore: (domain, data) => domain.restore(data),
      dispose: (domain) => domain.dispose(),
    });
    this._setFeaturesByDomain(data.featuresByDomain ?? {});
  }
}
