import { EdgeName } from "@elllphnt/elementa-base";
import {
  combineLatestOrEmpty,
  PointData,
  Rect,
  RectData,
} from "@elllphnt/elementa-utils";
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
} from "rxjs";
import { IHandle } from "../_types/_";
import { IElementaInteractor } from "../_types/interactor";
import { handleProperties } from "./_";
import { handleTypes } from "./_libs/types";
import { Handle } from "./handle";

export function generateSvgPath(start: DirectedPoint, end: DirectedPoint) {
  const { x: x1, y: y1, direction: dir1 } = start;
  const { x: x2, y: y2, direction: dir2 } = end;

  const dx = Math.abs(x2 - x1) / 2;
  const dy = Math.abs(y2 - y1) / 2;

  let cp1x, cp1y, cp2x, cp2y;

  switch (dir1) {
    case "up":
      cp1x = x1;
      cp1y = y1 - dy;
      break;
    case "down":
      cp1x = x1;
      cp1y = y1 + dy;
      break;
    case "left":
      cp1x = x1 - dx;
      cp1y = y1;
      break;
    case "right":
      cp1x = x1 + dx;
      cp1y = y1;
      break;
  }

  switch (dir2) {
    case "up":
      cp2x = x2;
      cp2y = y2 - dy;
      break;
    case "down":
      cp2x = x2;
      cp2y = y2 + dy;
      break;
    case "left":
      cp2x = x2 - dx;
      cp2y = y2;
      break;
    case "right":
      cp2x = x2 + dx;
      cp2y = y2;
      break;
  }

  return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
}

export type DirectedPoint = {
  x: number;
  y: number;
  direction: "left" | "right" | "up" | "down";
};
export type PartialDirectedPoint = Omit<DirectedPoint, "direction"> &
  Partial<Pick<DirectedPoint, "direction">>;

export class ConnectionHandle extends Handle {
  static counter = 0;
  static id(no: number | string) {
    return `connection-${no}`;
  }

  private _start$ = new BehaviorSubject<Handle | PartialDirectedPoint>({
    x: 0,
    y: 0,
    direction: "right",
  });
  private _end$ = new BehaviorSubject<Handle | PartialDirectedPoint>({
    x: 0,
    y: 0,
    direction: "left",
  });

  get start$() {
    return this._start$.asObservable();
  }
  get start() {
    return this._start$.value;
  }

  get end$() {
    return this._end$.asObservable();
  }
  get end() {
    return this._end$.value;
  }

  get startHandle$() {
    return this.start$.pipe(
      switchMap((start) => {
        if (start instanceof Handle) {
          return of(start);
        } else {
          return of(undefined);
        }
      })
    );
  }
  get startHandle() {
    return this.start instanceof Handle ? this.start : undefined;
  }

  get endHandle$() {
    return this.end$.pipe(
      switchMap((end) => {
        if (end instanceof Handle) {
          return of(end);
        } else {
          return of(undefined);
        }
      })
    );
  }
  get endHandle() {
    return this.end instanceof Handle ? this.end : undefined;
  }

  get active$() {
    return combineLatestOrEmpty([
      this.startHandle$.pipe(
        switchMap((start) => {
          if (start) {
            return start.active$;
          } else {
            return of(false);
          }
        })
      ),
      this.endHandle$.pipe(
        switchMap((end) => {
          if (end) {
            return end.active$;
          } else {
            return of(false);
          }
        })
      ),
      super.active$,
    ]).pipe(
      map(
        ([startActive, endActive, active]) => startActive || endActive || active
      )
    );
  }
  get active() {
    const start = this.startHandle;
    const end = this.endHandle;

    return start?.active || end?.active || super.active;
  }

  get vertexes(): [PartialDirectedPoint, PartialDirectedPoint] {
    let startVertex: [Rect, EdgeName[]] | PartialDirectedPoint;
    let endVertex: [Rect, EdgeName[]] | PartialDirectedPoint;

    if (this.start instanceof Handle) {
      startVertex = [this.start.contentRect, this.start.allowedPortPlacements];
    } else {
      startVertex = this.start;
    }

    if (this.end instanceof Handle) {
      endVertex = [this.end.contentRect, this.end.allowedPortPlacements];
    } else {
      endVertex = this.end;
    }

    return this.resolveVertexes(startVertex, endVertex);
  }
  get vertexes$(): Observable<[PartialDirectedPoint, PartialDirectedPoint]> {
    return combineLatest([
      this.start$.pipe(
        switchMap((start) => {
          if (start instanceof Handle) {
            return combineLatestOrEmpty([
              start.contentRect$,
              start.allowedPortPlacements$,
            ]).pipe(
              map(
                ([rect, allowedPortPlacements]) =>
                  [rect, allowedPortPlacements] as [Rect, EdgeName[]]
              )
            );
          } else {
            return of(start);
          }
        })
      ),
      this.end$.pipe(
        switchMap((end) => {
          if (end instanceof Handle) {
            return combineLatestOrEmpty([
              end.contentRect$,
              end.allowedPortPlacements$,
            ]).pipe(
              map(
                ([rect, allowedPortPlacements]) =>
                  [rect, allowedPortPlacements] as [Rect, EdgeName[]]
              )
            );
          } else {
            return of(end);
          }
        })
      ),
    ]).pipe(map(([start, end]) => this.resolveVertexes(start, end)));
  }

  get viewporVertexes$() {
    return this.vertexes$.pipe(
      switchMap(([start, end]) => {
        return combineLatestOrEmpty([
          this.interactor.stager.viewport.contentToViewport$(start),
          this.interactor.stager.viewport.contentToViewport$(end),
        ]).pipe(
          map(([s, e]) => {
            return [
              {
                x: s.x,
                y: s.y,
                direction: start.direction,
              },
              {
                x: e.x,
                y: e.y,
                direction: end.direction,
              },
            ];
          })
        );
      })
    );
  }
  get viewportVertexes() {
    const [start, end] = this.vertexes;
    const s = this.interactor.stager.viewport.contentToViewport(start);
    const e = this.interactor.stager.viewport.contentToViewport(end);

    return [
      {
        x: s.x,
        y: s.y,
        direction: start.direction,
      },
      {
        x: e.x,
        y: e.y,
        direction: end.direction,
      },
    ];
  }

  resolveVertexes(
    start: [Rect, EdgeName[]] | PartialDirectedPoint,
    end: [Rect, EdgeName[]] | PartialDirectedPoint
  ): [PartialDirectedPoint, PartialDirectedPoint] {
    const startOptions = this.getVertexOptions(start);
    const endOptions = this.getVertexOptions(end);
    return this.resolveVertexPointsFromOptions(startOptions, endOptions);
  }

  resolveVertexPointsFromOptions(
    startOptions: PartialDirectedPoint[],
    endOptions: PartialDirectedPoint[]
  ): [PartialDirectedPoint, PartialDirectedPoint] {
    let minDistance = Infinity;
    let minPair: [PartialDirectedPoint, PartialDirectedPoint] = [
      startOptions[0] ?? { x: 0, y: 0, direction: "right" },
      endOptions[0] ?? { x: 0, y: 0, direction: "left" },
    ];

    for (const start of startOptions) {
      for (const end of endOptions) {
        const distance = this.getDistance(start, end);
        if (distance < minDistance) {
          minDistance = distance;
          minPair = [start, end];
        }
      }
    }

    return minPair;
  }

  getDistance(start: PointData, end: PointData): number {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
  }
  getVertexOptions(
    source: [RectData, EdgeName[]] | PartialDirectedPoint
  ): PartialDirectedPoint[] {
    if (Array.isArray(source)) {
      const rect = source[0];
      const edges = source[1];
      return edges.map((edge) => {
        switch (edge) {
          case "bottom":
            return {
              x: rect.x + rect.width / 2,
              y: rect.y + rect.height,
              direction: "down",
            };
          case "top":
            return {
              x: rect.x + rect.width / 2,
              y: rect.y,
              direction: "up",
            };
          case "left":
            return {
              x: rect.x,
              y: rect.y + rect.height / 2,
              direction: "left",
            };
          case "right":
            return {
              x: rect.x + rect.width,
              y: rect.y + rect.height / 2,
              direction: "right",
            };
        }
      });
    } else {
      return [source];
    }
  }

  constructor({
    interactor,
    parent,
  }: {
    interactor: IElementaInteractor;
    parent: IHandle | null;
  }) {
    super({
      interactor,
      id: ConnectionHandle.id(ConnectionHandle.counter++),
      type: handleTypes.connection,
      parent,
    });
    this.setProperty(handleProperties.isSelectable, true);

    // const styleSubscription = combineLatestOrEmpty([
    //   this.viewporVertexes$,
    //   this.renderable.htmlElements$,
    // ]).subscribe(([vertexes, htmlElements]) => {
    //   const svgEl = htmlElements[this.entity.id];
    //   const fillEl = htmlElements["fill"];
    //   const strokeEl = htmlElements["stroke"];
    //   const handleEl = htmlElements["handle"];
    //   const startEl = htmlElements["start"];
    //   const endEl = htmlElements["end"];

    //   if (!svgEl || !fillEl || !strokeEl) return;

    //   const [start, end] = vertexes;

    //   const top = Math.min(start.y, end.y);
    //   const left = Math.min(start.x, end.x);
    //   const width = Math.max(1, Math.abs(end.x - start.x));
    //   const height = Math.max(1, Math.abs(end.y - start.y));

    //   svgEl.classList.add(this.id || "connection" + this.key);

    //   svgEl.style.top = `${top}px`;
    //   svgEl.style.left = `${left}px`;
    //   svgEl.style.width = `${width}px`;
    //   svgEl.style.height = `${height}px`;
    //   svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);

    //   let startDirection = start.direction;
    //   let endDirection = end.direction;

    //   if (!startDirection && !endDirection) {
    //     if (start.x < end.x) {
    //       startDirection = "right";
    //       endDirection = "left";
    //     } else if (start.x > end.x) {
    //       startDirection = "left";
    //       endDirection = "right";
    //     } else if (start.y < end.y) {
    //       startDirection = "down";
    //       endDirection = "up";
    //     } else if (start.y > end.y) {
    //       startDirection = "up";
    //       endDirection = "down";
    //     }
    //   } else if (startDirection && !endDirection) {
    //     if (startDirection === "right") {
    //       endDirection = "left";
    //     } else if (startDirection === "left") {
    //       endDirection = "right";
    //     } else if (startDirection === "up") {
    //       endDirection = "down";
    //     } else if (startDirection === "down") {
    //       endDirection = "up";
    //     }
    //   } else if (!startDirection && endDirection) {
    //     if (endDirection === "right") {
    //       startDirection = "left";
    //     } else if (endDirection === "left") {
    //       startDirection = "right";
    //     } else if (endDirection === "up") {
    //       startDirection = "down";
    //     } else if (endDirection === "down") {
    //       startDirection = "up";
    //     }
    //   }

    //   const pathStart = {
    //     x: start.x - left,
    //     y: start.y - top,
    //     direction: startDirection!,
    //   };
    //   const pathEnd = {
    //     x: end.x - left,
    //     y: end.y - top,
    //     direction: endDirection!,
    //   };

    //   startEl?.setAttribute("cx", pathStart.x.toString());
    //   startEl?.setAttribute("cy", pathStart.y.toString());

    //   endEl?.setAttribute("cx", pathEnd.x.toString());
    //   endEl?.setAttribute("cy", pathEnd.y.toString());

    //   fillEl.setAttribute("d", generateSvgPath(pathStart, pathEnd));
    //   strokeEl.setAttribute("d", generateSvgPath(pathStart, pathEnd));
    //   handleEl?.setAttribute("d", generateSvgPath(pathStart, pathEnd));
    // });

    // const activeSubscription = this.active$.subscribe((active) => {
    //   const rootEl = this.renderable.htmlElements[this.entity.id];
    //   if (!rootEl) return;

    //   if (active) {
    //     rootEl.classList.add("active");
    //   } else {
    //     rootEl.classList.remove("active");
    //   }
    // });

    // const hoverSubscription = this.hovered$.subscribe((hovered) => {
    //   const rootEl = this.renderable.htmlElements[this.entity.id];
    //   if (!rootEl) return;

    //   if (hovered) {
    //     rootEl.classList.add("hovered");
    //   } else {
    //     rootEl.classList.remove("hovered");
    //   }
    // });

    this.addDisposer(() => {
      // styleSubscription.unsubscribe();
      // activeSubscription.unsubscribe();
      // hoverSubscription.unsubscribe();

      this._start$.complete();
      this._end$.complete();
    });
  }

  delete(): void {
    if (this.start instanceof Handle) {
      // if (this.start.disconnect()) {
      //   return;
      // }
    }
    if (this.end instanceof Handle) {
      // if (this.end.disconnect()) {
      //   return;
      // }
    }
  }

  setStart(start: Handle | PartialDirectedPoint) {
    this._start$.next(start);
  }
  setEnd(end: Handle | PartialDirectedPoint) {
    this._end$.next(end);
  }
}
