import { Infrastructure, PackageData } from "@elllphnt/elementa-models";
import { combineLatestOrEmpty, Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject, map, Observable, Subscription } from "rxjs";
import { JsxEmit, ScriptTarget, transpileModule } from "typescript";

const externalModules = ["react", "react-dom"];

type ModuleData = {
  url: string;
  value: any;
  evaluationNumber: number;
  error?: any;
};

/**
 * ReactiveModule encapsulates a module's reactive state and control methods
 */
export interface ReactiveModule {
  readonly url: string;

  /** Current module exports */
  get value(): any;
  /** Reactive exports */
  readonly value$: Observable<any>;

  /** Whether the module has been successfully evaluated */
  get resolved(): boolean;
  /** Reactive resolved state */
  readonly resolved$: Observable<boolean>;

  /** Last evaluation error (if any) */
  get error(): any;
  /** Reactive error state */
  readonly error$: Observable<any>;

  /** List of dependencies (urls) */
  get deps(): string[];
  /** Reactive dependency list */
  readonly deps$: Observable<string[]>;

  /** Trigger (re)loading of the module */
  load(): Promise<void>;
  /** Dispose and clean up subscriptions */
  dispose(): void;
}

class ReactiveModuleImpl implements ReactiveModule {
  constructor(
    public readonly url: string,
    private readonly subject: BehaviorSubject<ModuleData>,
    private readonly manager: ModuleManager
  ) {}

  get value() {
    return this.subject.value.value;
  }
  get value$(): Observable<any> {
    return this.subject.asObservable().pipe(map((d) => d.value));
  }

  get resolved() {
    return (
      this.subject.value.evaluationNumber >= 0 &&
      this.subject.value.error === undefined
    );
  }
  get resolved$(): Observable<boolean> {
    return this.subject
      .asObservable()
      .pipe(map((d) => d.evaluationNumber >= 0 && d.error === undefined));
  }

  get error() {
    return this.subject.value.error;
  }
  get error$(): Observable<any> {
    return this.subject.asObservable().pipe(map((d) => d.error));
  }

  get deps() {
    return this.manager._dependencyMap.get(this.url) ?? [];
  }
  get deps$(): Observable<string[]> {
    return this.subject.asObservable().pipe(map(() => this.deps));
  }

  async load() {
    const project = this.manager.infrastructure.fileSystem.getFileProject(
      this.url
    );
    const packages = project?.packageManager.packages ?? [];
    await this.manager.evaluateModule({ url: this.url, packages });
  }

  dispose() {
    this.manager._disposeModule(this.url);
  }
}

/**
 * ModuleManager handles loading, caching, and reactive updates of modules
 */
export class ModuleManager extends Disposable {
  readonly infrastructure: Infrastructure;
  readonly serviceWorkerBaseUrl: string;
  private evaluationNumber = 1;

  readonly _moduleSubjects = new Map<string, BehaviorSubject<ModuleData>>();
  readonly _dependencyMap = new Map<string, string[]>();
  private readonly _watchSubscriptions = new Map<string, Subscription>();

  constructor({
    serviceWorkerBaseUrl,
    infrastructure,
  }: {
    serviceWorkerBaseUrl: string;
    infrastructure: Infrastructure;
  }) {
    super();
    this.serviceWorkerBaseUrl = serviceWorkerBaseUrl;
    this.infrastructure = infrastructure;
  }

  /**
   * Get a reactive module object for the given URL
   */
  module(url: string): ReactiveModule {
    const subject = this.moduleSubject(url);
    return new ReactiveModuleImpl(url, subject, this);
  }

  /**
   * Shortcut to exports observable
   */
  module$(url: string): Observable<any> {
    return this.moduleSubject(url)
      .asObservable()
      .pipe(map((d) => d.value));
  }

  /**
   * Get cached exports if available
   */
  getCached<T>(url: string): T | undefined {
    return this._moduleSubjects.get(url)?.value.value as T | undefined;
  }

  /**
   * Async fetch exports, triggering load if needed
   */
  async getModule<T>(url: string): Promise<T | undefined> {
    const subject = this._moduleSubjects.get(url);
    if (
      subject?.value.value !== undefined &&
      subject.value.error === undefined
    ) {
      return subject.value.value as T;
    }
    const project = this.infrastructure.fileSystem.getFileProject(url);
    const packages = project?.packageManager.packages ?? [];
    await this.evaluateModule({ url, packages });
    return this._moduleSubjects.get(url)?.value.value as T | undefined;
  }

  private moduleSubject(url: string): BehaviorSubject<ModuleData> {
    const standardUrl = this.infrastructure.fileSystem.getStandardFileUrl(url);
    let subject = this._moduleSubjects.get(standardUrl);
    if (!subject) {
      subject = this.watchModule(standardUrl);
      this._moduleSubjects.set(standardUrl, subject);
    }
    return subject;
  }

  private watchModule(url: string): BehaviorSubject<ModuleData> {
    const project = this.infrastructure.fileSystem.getFileProject(url);
    if (!project) {
      throw new Error(`Project not found for file: ${url}`);
    }
    const subject = new BehaviorSubject<ModuleData>({
      url,
      value: undefined,
      evaluationNumber: -1,
      error: undefined,
    });
    this._moduleSubjects.set(url, subject);

    const subscription = combineLatestOrEmpty([
      this.infrastructure.fileSystem.fileContent$(url).pipe(map((c) => c)),
      project.packageManager.packages$,
    ]).subscribe(async ([, packages]) => {
      await this.evaluateModule({ url, packages });
    });
    this._watchSubscriptions.set(url, subscription);

    return subject;
  }

  /**
   * Dispose subscriptions and state for a module
   */
  _disposeModule(url: string): void {
    const sub = this._watchSubscriptions.get(url);
    sub?.unsubscribe();
    this._watchSubscriptions.delete(url);

    const subject = this._moduleSubjects.get(url);
    subject?.complete();
    this._moduleSubjects.delete(url);

    this._dependencyMap.delete(url);
  }

  async evaluateModule({
    url,
    packages,
    evaluationNumber,
  }: {
    url: string;
    packages: PackageData[];
    evaluationNumber?: number;
  }) {
    const currentEvaluationNumber = evaluationNumber ?? this.evaluationNumber++;
    try {
      await this.loadFileToSW({ url, packages });
      const value = await this._readModule(url, currentEvaluationNumber);
      this._moduleSubjects.get(url)?.next({
        url,
        value,
        evaluationNumber: currentEvaluationNumber,
        error: undefined,
      });

      // Re-evaluate dependents
      const dependents = Array.from(this._dependencyMap.entries())
        .filter(([, deps]) => deps.includes(url))
        .map(([depUrl]) => depUrl);
      for (const depUrl of dependents) {
        const data = this._moduleSubjects.get(depUrl)?.value;
        if (data?.evaluationNumber !== currentEvaluationNumber) {
          await this.evaluateModule({
            url: depUrl,
            packages,
            evaluationNumber: currentEvaluationNumber,
          });
        }
      }
    } catch (error) {
      console.error("Error evaluating module", url, error);
      this._moduleSubjects.get(url)?.next({
        url,
        value: undefined,
        evaluationNumber: currentEvaluationNumber,
        error,
      });
    }
  }

  private async _readModule(url: string, evalNum: number): Promise<any> {
    const hashed = encodeURIComponent(url);
    const importUrl = `${this.serviceWorkerBaseUrl}/modules/${evalNum}/${hashed}`;
    try {
      return await import(/* @vite-ignore */ importUrl);
    } catch (e) {
      console.error(e);
      console.error(`Failed to read module: ${url}`);
      throw e;
    }
  }

  /**
   * Transpile TypeScript to JavaScript
   */
  transpileToJs(content: string): string {
    return transpileModule(content, {
      compilerOptions: {
        target: ScriptTarget.ESNext,
        jsx: JsxEmit.React,
      },
    }).outputText;
  }

  /**
   * Rewrite import statements (sync visitor), collect dependencies
   */
  async transpileDependencies(
    url: string,
    content: string,
    packages: PackageData[]
  ): Promise<[string | undefined, string[]]> {
    const babel = await import("@babel/standalone");
    const dependencies: string[] = [];
    if (!content) {
      return [undefined, dependencies];
    }
    const packageMap = packages.reduce((map, p) => {
      map[p.name] = p;
      return map;
    }, {} as Record<string, PackageData>);
    const result = babel.transform(content, {
      plugins: [
        {
          visitor: {
            ImportDeclaration(path: any) {
              const source = path.node.source.value as string;
              if (
                externalModules.some(
                  (m) => source === m || source.startsWith(m + "/")
                )
              ) {
                return;
              }
              if (source.startsWith("local:")) {
                const abs = this.infrastructure.fileSystem.getAbsoluteFileUrl(
                  url,
                  source
                );
                dependencies.push(abs);
                path.node.source.value = `${
                  this.serviceWorkerBaseUrl
                }/modules/${this.evaluationNumber}/${encodeURIComponent(abs)}`;
              } else {
                const pkg = packageMap[source];
                if (pkg) {
                  path.node.source.value = `https://esm.sh/${pkg.name}@${
                    pkg.version
                  }?external=${externalModules.join(",")}`;
                }
              }
            },
          },
        },
      ],
    });
    return [result.code as string, dependencies];
  }

  /**
   * Load compiled script into the service worker cache
   */
  async loadScriptToSW(url: string, content: string) {
    try {
      await fetch(
        `${this.serviceWorkerBaseUrl}/modules/${encodeURIComponent(url)}`,
        {
          method: "POST",
          body: content,
        }
      );
    } catch (e) {
      console.error("Failed to load script to SW", url, e);
      throw e;
    }
  }

  /**
   * Compile, rewrite, cache, and track dependencies
   */
  async loadFileToSW({
    url,
    packages,
  }: {
    url: string;
    packages: PackageData[];
  }) {
    try {
      const content = this.infrastructure.fileSystem.fileContent(url) ?? "";
      const jsScript = this.transpileToJs(content);
      const [transformedScript, dependencies] =
        await this.transpileDependencies(url, jsScript, packages);
      console.log("dependencies", dependencies);

      await this.loadScriptToSW(url, transformedScript ?? "");
      this._dependencyMap.set(url, dependencies);

      for (const dep of dependencies) {
        if (!this._dependencyMap.has(dep)) {
          await this.loadFileToSW({ url: dep, packages });
          this.watchModule(dep);
        }
      }
    } catch (e) {
      console.error("Failed to load file to SW", url, e);
      throw e;
    }
  }
}
