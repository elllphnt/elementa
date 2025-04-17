import { Disposable } from "@repo/utils";
import { filter, firstValueFrom, Observable, take, timeout } from "rxjs";

export abstract class Content<D = any> extends Disposable {
  abstract url: string;

  abstract name: string | undefined;
  abstract name$: Observable<string | undefined>;

  abstract data: D;
  abstract data$: Observable<D>;

  abstract loading: boolean;
  abstract loading$: Observable<boolean>;

  abstract loaded: boolean;
  abstract loaded$: Observable<boolean>;

  async untilLoaded(timeoutMs?: number): Promise<void> {
    await firstValueFrom(
      this.loaded$.pipe(
        filter((loaded) => loaded),
        take(1),
        timeoutMs ? timeout(timeoutMs) : take(1),
      ),
    );
  }

  abstract update(data: D): void;
  abstract setName(name: string): void;
  abstract delete(): Promise<void>;
}
