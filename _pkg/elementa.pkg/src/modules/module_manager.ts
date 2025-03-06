import { Infrastructure } from "@repo/elementa-models";
import { PackageData } from "@repo/elementa-models/src/project/package_manager";
import { combineLatestOrEmpty, Disposable } from "@repo/utils";
import { BehaviorSubject, map, Observable } from "rxjs";
import { JsxEmit, ScriptTarget, transpileModule } from "typescript";

const externalModules = ["react", "react-dom"];

type ModuleData = {
  url: string;
  value: any;
  evaluationNumber: number;
};

export class ModuleManager extends Disposable {
  readonly infrastructure: Infrastructure;
  readonly serviceWorkerBaseUrl: string;

  evaluationNumber = 1;

  private _moduleSubjects = new Map<string, BehaviorSubject<ModuleData>>();
  private _dependencyMap = new Map<string, string[]>();

  private watchModule(url: string) {
    const project = this.infrastructure.fileSystem.getFileProject(url);
    if (!project) {
      throw new Error(`Project not found for file: ${url}`);
    }
    const subject = new BehaviorSubject<ModuleData>({
      url,
      value: undefined,
      evaluationNumber: -1,
    });
    this._moduleSubjects.set(url, subject);

    combineLatestOrEmpty([
      this.infrastructure.fileSystem
        .fileContent$(url)
        .pipe(map((content) => ({ content }))),
      project.packageManager.packages$,
    ]).subscribe(async ([, packages]) => {
      this.evaluateModule({ url, packages });
    });

    return subject;
  }
  private moduleSubject(url: string) {
    const standardUrl = this.infrastructure.fileSystem.getStandardFileUrl(url);
    let s = this._moduleSubjects.get(standardUrl);
    if (!s) {
      s = this.watchModule(standardUrl);
    }
    return s;
  }
  module(url: string) {
    const subject = this.moduleSubject(url);
    return subject.value.value;
  }
  module$(url: string): Observable<any> {
    const subject = this.moduleSubject(url);
    return subject.asObservable().pipe(map((d) => d.value));
  }

  private async evaluateModule({
    url,
    packages,
    evaluationNumber,
  }: {
    url: string;
    packages: any[];
    evaluationNumber?: number;
  }) {
    const currentEvaluationNumber = evaluationNumber ?? this.evaluationNumber++;
    await this.loadFileToSW({ url, packages });
    const value = await this._readModule(url);
    this._moduleSubjects.get(url)?.next({
      url,
      value,
      evaluationNumber: currentEvaluationNumber,
    });

    // update dependents
    const dependents = Array.from(this._dependencyMap.entries())
      .filter(([, dependencies]) => dependencies.includes(url))
      .map(([dependentUrl]) => dependentUrl);

    for (const dependentUrl of dependents) {
      const data = this._moduleSubjects.get(dependentUrl)?.value;
      if (data?.evaluationNumber !== currentEvaluationNumber) {
        this.evaluateModule({
          url: dependentUrl,
          packages,
          evaluationNumber: currentEvaluationNumber,
        });
      }
    }
  }

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

  private async _readModule(url: string): Promise<any> {
    const importUrl = `${this.serviceWorkerBaseUrl}/modules/${Math.random()}/${encodeURIComponent(url)}`;

    try {
      const value = await import(/* @vite-ignore */ importUrl);
      return value;
    } catch (e) {
      console.error(e);
      console.error(`Failed to read module: ${url}`);
      return undefined;
    }
  }

  transpileToJs(content: string) {
    return transpileModule(content, {
      compilerOptions: {
        target: ScriptTarget.ESNext,
        jsx: JsxEmit.React,
      },
    }).outputText;
  }
  async transpileDependencies(
    content: string,
    packages: PackageData[],
  ): Promise<Promise<[string | undefined, string[]]>> {
    const babel = await import("@babel/standalone");

    if (!content) {
      return [undefined, []] as any;
    }
    const packageMap = packages.reduce(
      (map, p) => {
        map[p.name] = p;
        return map;
      },
      {} as Record<string, any>,
    );
    const dependencies: string[] = [];
    const transformedScript = babel.transform(content, {
      plugins: [
        {
          visitor: {
            ImportDeclaration: async (path) => {
              if (
                externalModules.some((m) => {
                  return (
                    path.node.source.value === m ||
                    path.node.source.value.startsWith(m + "/")
                  );
                })
              ) {
                return;
              } else if (path.node.source.value.startsWith("fid:")) {
                const url = path.node.source.value;
                dependencies.push(url);
                path.node.source.value = `https://sw/modules/${Math.random()}/${encodeURIComponent(url)}`;
              } else {
                const source = path.node.source.value;
                const pkg = packageMap[source];
                if (pkg) {
                  path.node.source.value = `https://esm.sh/${pkg.name}@${pkg.version}?external=${externalModules.join(",")}`;
                }
              }
            },
          },
        },
      ],
    }).code;

    return [transformedScript ?? undefined, dependencies] as any;
  }

  async loadScriptToSW(url: string, content: string) {
    await fetch(`https://sw/modules/${encodeURIComponent(url)}`, {
      method: "POST",
      body: content,
    });
    console.log(`Loaded script to SW: ${url}`, content);
  }
  async loadFileToSW({
    url,
    packages,
  }: {
    url: string;
    packages: PackageData[];
  }) {
    const content = this.infrastructure.fileSystem.fileContent(url) ?? "";

    // compile ts to js
    const jsScript = this.transpileToJs(content);

    // transpile dependencies
    const [transformedScript, dependencies] = await this.transpileDependencies(
      jsScript,
      packages,
    );
    const standardDependencies = dependencies.map((url) =>
      this.infrastructure.fileSystem.getStandardFileUrl(url),
    );

    // load script to service worker
    await this.loadScriptToSW(url, transformedScript ?? "");
    this._dependencyMap.set(url, standardDependencies);

    // ensure dependencies are loaded
    for (const url of dependencies) {
      if (!this._dependencyMap.has(url)) {
        await this.loadFileToSW({ url, packages });
        this.watchModule(url);
      }
    }
  }
}
