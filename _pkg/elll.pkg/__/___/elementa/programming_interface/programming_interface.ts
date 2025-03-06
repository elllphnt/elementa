import { init } from "@paralleldrive/cuid2";
import { combineLatestOrEmpty, Datafiable, Disposable } from "@repo/utils";
import { BehaviorSubject, map, switchMap } from "rxjs";
import {
  CommandData,
  DomainData,
  ProgrammingInterfaceData,
  QueryData,
} from "./_types";

export class ProgrammingInterface
  extends Disposable
  implements Datafiable<ProgrammingInterfaceData>
{
  static defaultDomainKey = "__default__";
  static generateId = init({
    length: 7,
  });

  private _domains$ = new BehaviorSubject<Record<string, DomainData>>({});
  private _queries$ = new BehaviorSubject<Record<string, QueryData>>({});
  private _commands$ = new BehaviorSubject<Record<string, CommandData>>({});
  private _queriesByDomain$ = new BehaviorSubject<Record<string, string[]>>({});
  private _commandsByDomain$ = new BehaviorSubject<Record<string, string[]>>(
    {},
  );

  get domains$() {
    return this._domains$.pipe(map((domains) => Object.values(domains)));
  }
  get domains() {
    return Object.values(this._domains$.value);
  }

  get queries$() {
    return this._queries$.pipe(map((queries) => Object.values(queries)));
  }
  get queries() {
    return Object.values(this._queries$.value);
  }

  get commands$() {
    return this._commands$.pipe(map((commands) => Object.values(commands)));
  }
  get commands() {
    return Object.values(this._commands$.value);
  }

  queriesByDomain(domainId?: string) {
    return (
      this._queriesByDomain$.value[
        domainId ?? ProgrammingInterface.defaultDomainKey
      ] ?? []
    )
      .map((id) => this._queries$.value[id])
      .filter(Boolean) as QueryData[];
  }
  queriesByDomain$(domainId?: string) {
    return this._queriesByDomain$.pipe(
      map(
        (queriesByDomain) =>
          queriesByDomain[domainId ?? ProgrammingInterface.defaultDomainKey] ??
          [],
      ),
      switchMap((ids) =>
        combineLatestOrEmpty(
          ids.map((id) => this._queries$.pipe(map((qs) => qs[id]))),
        ),
      ),
      map((qs) => qs.filter(Boolean) as QueryData[]),
    );
  }

  commandsByDomain(domainId?: string) {
    return (
      this._commandsByDomain$.value[
        domainId ?? ProgrammingInterface.defaultDomainKey
      ] ?? []
    )
      .map((id) => this._commands$.value[id])
      .filter(Boolean) as CommandData[];
  }
  commandsByDomain$(domainId?: string) {
    return this._commandsByDomain$.pipe(
      map(
        (commandsByDomain) =>
          commandsByDomain[domainId ?? ProgrammingInterface.defaultDomainKey] ??
          [],
      ),
      switchMap((ids) =>
        combineLatestOrEmpty(
          ids.map((id) => this._commands$.pipe(map((cs) => cs[id]))),
        ),
      ),
      map((cs) => cs.filter(Boolean) as CommandData[]),
    );
  }

  get data() {
    return {
      domains: this.domains,
      queries: this.queries,
      commands: this.commands,
      queriesByDomain: this._queriesByDomain$.value,
      commandsByDomain: this._commandsByDomain$.value,
    };
  }
  get data$() {
    return combineLatestOrEmpty([
      this.domains$,
      this.queries$,
      this.commands$,
      this._queriesByDomain$,
      this._commandsByDomain$,
    ]).pipe(
      map(
        ([domains, queries, commands, queriesByDomain, commandsByDomain]) => ({
          domains,
          queries,
          commands,
          queriesByDomain,
          commandsByDomain,
        }),
      ),
    );
  }

  constructor() {
    super();

    this.addDisposer(() => {
      this._domains$.complete();
      this._queries$.complete();
      this._commands$.complete();
      this._queriesByDomain$.complete();
      this._commandsByDomain$.complete();
    });
  }

  private _setQueriesByDomain(data: Record<string, string[]>): void {
    let queryDomainMap: Record<string, string> = {};
    for (let domainKey in data) {
      if (
        domainKey !== ProgrammingInterface.defaultDomainKey &&
        !this._domains$.value[domainKey]
      ) {
        continue;
      }
      for (let queryId of data[domainKey]) {
        if (!this._queries$.value[queryId]) {
          continue;
        }
        queryDomainMap[queryId] = domainKey;
      }
    }
    const queriesByDomain: Record<string, string[]> = {};
    for (let queryId in queryDomainMap) {
      const domainId = queryDomainMap[queryId];
      queriesByDomain[domainId] = [
        ...(queriesByDomain[domainId] ?? []),
        queryId,
      ];
    }
    this._queriesByDomain$.next(queriesByDomain);
  }
  private _setCommandsByDomain(data: Record<string, string[]>): void {
    let commandDomainMap: Record<string, string> = {};
    for (let domainKey in data) {
      if (
        domainKey !== ProgrammingInterface.defaultDomainKey &&
        !this._domains$.value[domainKey]
      ) {
        continue;
      }
      for (let commandId of data[domainKey]) {
        if (!this._commands$.value[commandId]) {
          continue;
        }
        commandDomainMap[commandId] = domainKey;
      }
    }
    const commandsByDomain: Record<string, string[]> = {};
    for (let commandId in commandDomainMap) {
      const domainId = commandDomainMap[commandId];
      commandsByDomain[domainId] = [
        ...(commandsByDomain[domainId] ?? []),
        commandId,
      ];
    }
    this._commandsByDomain$.next(commandsByDomain);
  }

  addQuery(query: Omit<QueryData, "id">, domainId?: string): void {
    const id = ProgrammingInterface.generateId();
    this._queries$.next({
      ...this._queries$.value,
      [id]: { ...query, id },
    });
    const domainKey = domainId ?? ProgrammingInterface.defaultDomainKey;
    this._setQueriesByDomain({
      ...this._queriesByDomain$.value,
      [domainKey]: [...(this._queriesByDomain$.value[domainKey] ?? []), id],
    });
  }
  moveQuery(queryId: string, from: string, to: [string, number]): void {
    const fromDomainKey = from || ProgrammingInterface.defaultDomainKey;
    const toDomainKey = to[0] || ProgrammingInterface.defaultDomainKey;
    const fromQueries = (
      this._queriesByDomain$.value[fromDomainKey] ?? []
    ).filter((q) => q !== queryId);
    const toQueries = [...(this._queriesByDomain$.value[toDomainKey] ?? [])];
    toQueries.splice(to[1], 0, queryId);
    this._setQueriesByDomain({
      ...this._queriesByDomain$.value,
      [fromDomainKey]: fromQueries,
      [toDomainKey]: toQueries,
    });
  }

  addCommand(command: Omit<CommandData, "id">, domainId?: string): void {
    const id = ProgrammingInterface.generateId();
    this._commands$.next({
      ...this._commands$.value,
      [id]: { ...command, id },
    });
    const domainKey = domainId ?? ProgrammingInterface.defaultDomainKey;
    this._setCommandsByDomain({
      ...this._commandsByDomain$.value,
      [domainKey]: [...(this._commandsByDomain$.value[domainKey] ?? []), id],
    });
  }
  moveCommand(commandId: string, from: string, to: [string, number]): void {
    const fromDomainKey = from || ProgrammingInterface.defaultDomainKey;
    const toDomainKey = to[0] || ProgrammingInterface.defaultDomainKey;
    const fromCommands = (
      this._commandsByDomain$.value[fromDomainKey] ?? []
    ).filter((c) => c !== commandId);
    const toCommands = [...(this._commandsByDomain$.value[toDomainKey] ?? [])];
    toCommands.splice(to[1], 0, commandId);
    this._setCommandsByDomain({
      ...this._commandsByDomain$.value,
      [fromDomainKey]: fromCommands,
      [toDomainKey]: toCommands,
    });
  }

  addDomain(domain: Omit<DomainData, "id">): void {
    const id = ProgrammingInterface.generateId();
    this._domains$.next({
      ...this._domains$.value,
      [id]: { ...domain, id },
    });
  }
  moveDomain(domainId: string, to: number): void {
    const domainIds = Object.keys(this._domains$.value);
    if (!domainIds.includes(domainId)) return;
    domainIds.splice(domainIds.indexOf(domainId), 1);
    domainIds.splice(to, 0, domainId);
    const newDomains = domainIds.reduce(
      (acc, id) => {
        acc[id] = this._domains$.value[id];
        return acc;
      },
      {} as Record<string, DomainData>,
    );
    this._domains$.next(newDomains);
  }
  removeDomain(domainId: string): void {
    const domains = { ...this._domains$.value };
    delete domains[domainId];
    this._domains$.next(domains);
    // Move queries to default domain
    const queriesByDomain = { ...this._queriesByDomain$.value };
    queriesByDomain[ProgrammingInterface.defaultDomainKey] = [
      ...(queriesByDomain[ProgrammingInterface.defaultDomainKey] ?? []),
      ...(queriesByDomain[domainId] ?? []),
    ];
    delete queriesByDomain[domainId];
    this._setQueriesByDomain(queriesByDomain);
    // Move commands to default domain
    const commandsByDomain = { ...this._commandsByDomain$.value };
    commandsByDomain[ProgrammingInterface.defaultDomainKey] = [
      ...(commandsByDomain[ProgrammingInterface.defaultDomainKey] ?? []),
      ...(commandsByDomain[domainId] ?? []),
    ];
    delete commandsByDomain[domainId];
    this._setCommandsByDomain(commandsByDomain);
  }

  restore(data: ProgrammingInterfaceData): void {
    this._domains$.next(
      Object.fromEntries(
        data.domains?.map((domain) => [domain.id, domain]) ?? [],
      ),
    );
    this._queries$.next(
      Object.fromEntries(data.queries?.map((query) => [query.id, query]) ?? []),
    );
    this._commands$.next(
      Object.fromEntries(
        data.commands?.map((command) => [command.id, command]) ?? [],
      ),
    );
    this._setQueriesByDomain(data.queriesByDomain ?? {});
    this._setCommandsByDomain(data.commandsByDomain ?? {});
  }
}
