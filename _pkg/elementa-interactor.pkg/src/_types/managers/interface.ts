import { Disposable, PointData, Rect, RectData, VectorData } from "@repo/utils";
import { Observable } from "rxjs";
import { IElementaInteractor } from "../interactor";

export interface IInterface extends Disposable {
  readonly interactor: IElementaInteractor;

  get x(): number;
  get x$(): Observable<number>;

  get y(): number;
  get y$(): Observable<number>;

  get width(): number;
  get width$(): Observable<number>;

  get height(): number;
  get height$(): Observable<number>;

  get stagerRect(): RectData;
  get stagerRect$(): Observable<RectData>;

  setSize(width: number, height: number): void;
  setPosition(x: number, y: number): void;

  windowToInterface(point: PointData): PointData;
  windowToInterface$(point: PointData): Observable<PointData>;
  interfaceToWindow(point: PointData): PointData;
  interfaceToWindow$(point: PointData): Observable<PointData>;
  interactorToStager(point: PointData): PointData;
  interactorToStager$(point: PointData): Observable<PointData>;
  stagerToInteractor(point: PointData): PointData;
  stagerToInteractor$(point: PointData): Observable<PointData>;

  // vectordata
  vectorWindowToInterface(vector: VectorData): VectorData;
  vectorWindowToInterface$(vector: VectorData): Observable<VectorData>;
  vectorInterfaceToWindow(vector: VectorData): VectorData;
  vectorInterfaceToWindow$(vector: VectorData): Observable<VectorData>;
  vectorInteractorToStager(vector: VectorData): VectorData;
  vectorInteractorToStager$(vector: VectorData): Observable<VectorData>;
  vectorStagerToInteractor(vector: VectorData): VectorData;
  vectorStagerToInteractor$(vector: VectorData): Observable<VectorData>;

  // rect
  rectWindowToInterface(rect: RectData): Rect;
  rectWindowToInterface$(rect: RectData): Observable<Rect>;
  rectInterfaceToWindow(rect: RectData): Rect;
  rectInterfaceToWindow$(rect: RectData): Observable<Rect>;
  rectInteractorToStager(rect: RectData): Rect;
  rectInteractorToStager$(rect: RectData): Observable<Rect>;
  rectStagerToInteractor(rect: RectData): Rect;
  rectStagerToInteractor$(rect: RectData): Observable<Rect>;

  // bounding rect
  interfaceRect(element: HTMLElement): RectData;
  windowRect(element: HTMLElement): RectData;

  // event
  handleWheel(e: WheelEvent): void;
}
