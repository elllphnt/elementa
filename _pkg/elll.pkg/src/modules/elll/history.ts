import { Repository } from "@repo/backend";
import { combineLatestOrEmpty } from "@repo/utils";
import { firstValueFrom, map, Observable, of, switchMap, tap } from "rxjs";
import { IElll } from "~/src/types/elll";

const repositoryHistoryConfigurationKey = "elll-repository-history";
const repositoryHistoryMaxSize = 100;

export type RepositoryHistoryData = {
  repositories?: {
    [repositoryId: string]: {
      openedAt: number;
    };
  };
};

export class RepositoryHistory {
  readonly elll: IElll;

  get configurationQuery() {
    return this.elll.user?.configuration(repositoryHistoryConfigurationKey);
  }
  get configurationQuery$() {
    return this.elll.user$.pipe(
      map((user) => user?.configuration(repositoryHistoryConfigurationKey)),
    );
  }

  get loading() {
    return this.configurationQuery?.fetching;
  }
  get loading$() {
    return this.configurationQuery$.pipe(
      switchMap((query) => query?.fetching$ ?? of(undefined)),
    );
  }

  get configuration() {
    return this.configurationQuery?.data;
  }
  get configuration$() {
    return this.configurationQuery$.pipe(
      switchMap((query) => query?.data$ ?? of(undefined)),
    );
  }

  get data(): RepositoryHistoryData | undefined {
    return this.configuration?.data;
  }
  get data$() {
    return this.configuration$.pipe(
      switchMap((configuration) => configuration?.data$ ?? of(undefined)),
    ) as Observable<RepositoryHistoryData | undefined>;
  }

  get repositories() {
    return this.data?.repositories ?? {};
  }
  get repositories$() {
    return this.data$.pipe(map((data) => data?.repositories ?? {}));
  }

  recent(count: number) {
    return Object.keys(this.repositories)
      .slice(0, count)
      .map((repositoryId) =>
        this.elll.backend.instance<Repository>(repositoryId, true),
      );
  }
  recent$(count: number) {
    return this.repositories$.pipe(
      tap((repositories) => {
        console.log("repositories before map", count, repositories);
      }),
      map((repositories) =>
        Object.keys(repositories)
          .slice(0, count)
          .map((repositoryId) =>
            this.elll.backend.instance<Repository>(repositoryId, true),
          ),
      ),
    );
  }

  constructor({ elll }: { elll: IElll }) {
    this.elll = elll;

    // push current repository to history
    this.elll.repository$.subscribe((repository) => {
      if (repository) {
        this.push(repository.id);
      }
    });

    setTimeout(() => {
      // watch recent repositories notFound and remove them from history
      this.recent$(10)
        .pipe(
          tap((repositories) => {
            console.log("repositories before switchMap", repositories);
          }),
          switchMap((repositories) =>
            combineLatestOrEmpty(
              repositories.map((repository) =>
                repository.notFound$.pipe(
                  map((notFound) => ({ repository, notFound })),
                ),
              ),
            ),
          ),
        )
        .subscribe((repositories) => {
          console.log("repositories", repositories);
          repositories.forEach(({ repository, notFound }) => {
            if (notFound) {
              this.remove(repository.id);
            }
          });
        });
    });
  }

  async push(repositoryId: string) {
    const configuration = await firstValueFrom(this.configuration$);
    if (!configuration) {
      return false;
    }

    const data: RepositoryHistoryData = {
      ...(configuration.data ?? {
        repositories: {},
      }),
    };
    data.repositories = {
      ...data.repositories,
      [repositoryId]: { openedAt: Date.now() },
    };
    data.repositories = Object.fromEntries(
      Object.entries(data.repositories)
        .sort(([, a], [, b]) => b.openedAt - a.openedAt)
        .slice(0, repositoryHistoryMaxSize),
    );

    configuration.setData(data);
  }
  async remove(repositoryId: string) {
    const configuration = await firstValueFrom(this.configuration$);
    if (!configuration) {
      return false;
    }

    const data: RepositoryHistoryData = configuration.data ?? {
      repositories: {},
    };
    delete data.repositories?.[repositoryId];

    configuration.setData(data);
  }
}
