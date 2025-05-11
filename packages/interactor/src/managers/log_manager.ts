import { Disposable } from "@elllphnt/elementa-utils";
import { BehaviorSubject } from "rxjs";

export interface Diagnostic {
  level: string;
  data: any[];
  timestamp: Date;
}

export class LogManager extends Disposable {
  private _logs$: BehaviorSubject<Diagnostic[]>;

  get logs() {
    return this._logs$.value;
  }

  get logs$() {
    return this._logs$.asObservable();
  }

  constructor() {
    super();
    this._logs$ = new BehaviorSubject<Diagnostic[]>([]);

    this.addDisposer(() => {
      this._logs$.complete();
    });
  }

  log({ level, data }: { level: string; data: any[] }) {
    const newLog: Diagnostic = {
      level,
      data,
      timestamp: new Date(),
    };
    this._logs$.next([...this._logs$.value, newLog]);
  }

  clear() {
    this._logs$.next([]);
  }
}
