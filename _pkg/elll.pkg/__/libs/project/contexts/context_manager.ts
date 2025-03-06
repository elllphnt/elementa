import {
  Context,
  ContextData,
  ContextManager,
  createContext,
  ViewportContext,
} from "@repo/elementa";
import { restoreReactiveMap } from "@repo/elementa/dist/_lib/restore";
import { ColorSchemeContext } from "@repo/elementa/dist/project/contexts/color_scheme";
import { combineLatestOrEmpty } from "@repo/utils";
import { BehaviorSubject, map, Observable, switchMap } from "rxjs";
import { Elll } from "../../../elll/elll";
import { mimeTypes } from "../../constants/mime_types";
import { Persistor } from "../../persitor";
import { ElllProject } from "../project";

const contextFilePath = ".elll/contexts.json";

export type ContextStoreData = {
  contexts: ContextData[];
};

export class ElllContextManager extends ContextManager {
  readonly project: ElllProject;
  readonly persitor: Persistor<ContextStoreData>;

  private _contexts$ = new BehaviorSubject<Record<string, Context>>({});

  get elll(): Elll {
    return this.project.elll;
  }

  get contexts(): Context[] {
    return Object.values(this._contexts$.value);
  }
  get contexts$(): Observable<Context[]> {
    return this._contexts$
      .asObservable()
      .pipe(map((contexts) => Object.values(contexts)));
  }
  context(id: string): Context | undefined {
    return this._contexts$.value[id];
  }
  context$(id: string): Observable<Context | undefined> {
    return this._contexts$.pipe(map((contexts) => contexts[id]));
  }

  get data$(): Observable<ContextStoreData> {
    return combineLatestOrEmpty([
      this._contexts$.pipe(
        switchMap((contexts) =>
          combineLatestOrEmpty(
            Object.values(contexts).map((context) => context.data$),
          ),
        ),
      ),
    ]).pipe(
      map(([contexts]) => ({
        contexts,
      })),
    );
  }

  constructor({ project }: { project: ElllProject }) {
    super();
    this.project = project;

    const mobile = new ViewportContext({ id: "mobile", project: this.project });
    const tablet = new ViewportContext({ id: "tablet", project: this.project });

    mobile.setName("mobile");
    mobile.setFromWidth(0);
    mobile.setToWidth(600);

    tablet.setName("tablet");
    tablet.setFromWidth(600);
    tablet.setToWidth(1200);

    const light = new ColorSchemeContext({
      id: "light",
      project: this.project,
    });
    light.setName("light");
    light.setColorScheme("light");

    const dark = new ColorSchemeContext({
      id: "dark",
      project: this.project,
    });
    dark.setName("dark");
    dark.setColorScheme("dark");

    this._contexts$.next({
      [mobile.id]: mobile,
      [tablet.id]: tablet,
      [light.id]: light,
      [dark.id]: dark,
    });

    this.persitor = new Persistor<ContextStoreData>({
      elll: this.elll,
      resolveFile: (elll) =>
        elll.fileAtPath(contextFilePath, {
          type: mimeTypes.json,
        }),
      resolveFile$: (elll) =>
        elll.fileAtPath$(contextFilePath, {
          type: mimeTypes.json,
        }),
    });

    // Restore data
    const restoreSubscription = this.persitor.data$.subscribe((data) =>
      this.restore(data),
    );
    // Save data
    const saveSubscription = combineLatestOrEmpty([
      this.data$,
      this.persitor.loaded$,
    ]).subscribe(([data]) => {
      this.persitor.save(data);
    });

    this.addDisposer(() => {
      restoreSubscription.unsubscribe();
      saveSubscription.unsubscribe();

      this.persitor.dispose();
      this.contexts.forEach((context) => context.dispose());

      this._contexts$.next({});
      this._contexts$.complete();
    });
  }

  restore(data: ContextStoreData) {
    restoreReactiveMap({
      datafiable$: this._contexts$,
      data: Object.fromEntries(
        data.contexts.map((contextData) => [contextData._id, contextData]),
      ) as Record<string, ContextData>,
      create: (contextData) =>
        createContext({
          type: contextData.type,
          id: contextData._id,
          project: this.project,
        }),
      restore: (context, contextData) => context.restore(contextData),
      dispose: (context) => context.dispose(),
    });
  }
}
