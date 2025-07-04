import { Lifecycle } from "@elllphnt/elementa-kernel";
import _ from "lodash";
import { BehaviorSubject } from "rxjs";
import type { Handle } from "~/_types/handles/handle.js";
import type {
  DropCase,
  IInteractionManager,
} from "~/_types/managers/interaction.js";
import { handleProperties } from "~/handles/_libs/properties.js";
import { handleTypes } from "~/handles/_libs/types.js";

export class InteractionManager
  extends Lifecycle
  implements IInteractionManager
{
  private _dropCase$: BehaviorSubject<DropCase | undefined>;
  private _selection$: BehaviorSubject<Handle[]>;

  private _hovered$: BehaviorSubject<Handle | undefined>;
  private _focused$: BehaviorSubject<Handle | undefined>;
  private _dropTarget$: BehaviorSubject<Handle | undefined>;

  get focused() {
    return this._focused$.value;
  }
  get focused$() {
    return this._focused$.asObservable();
  }

  get hovered() {
    return this._hovered$.value;
  }
  get hovered$() {
    return this._hovered$.asObservable();
  }

  get selection() {
    return this._selection$.value;
  }
  get selection$() {
    return this._selection$.asObservable();
  }

  get dropCase() {
    return this._dropCase$.value;
  }
  get dropCase$() {
    return this._dropCase$.asObservable();
  }

  get dropTarget() {
    return this._dropTarget$.value;
  }
  get dropTarget$() {
    return this._dropTarget$.asObservable();
  }

  constructor() {
    super();

    this._hovered$ = new BehaviorSubject<Handle | undefined>(undefined);
    this._focused$ = new BehaviorSubject<Handle | undefined>(undefined);
    this._selection$ = new BehaviorSubject<Handle[]>([]);
    this._dropCase$ = new BehaviorSubject<DropCase | undefined>(undefined);
    this._dropTarget$ = new BehaviorSubject<Handle | undefined>(undefined);

    // const dropTargetSubscription = this.dropCase$.subscribe((dropCase) => {
    //   if (dropCase) {
    //     this._dropTarget$.next(
    //       dropCase.target.resolveDropTarget({ datatypes: dropCase.datatypes })
    //     );
    //   } else {
    //     this._dropTarget$.next(undefined);
    //   }
    // });

    this.addDisposer(() => {
      // dropTargetSubscription.unsubscribe();

      this._hovered$.complete();
      this._focused$.complete();
      this._selection$.complete();
      this._dropCase$.complete();
      this._dropTarget$.complete();
    });
  }
  setDropCase(dropCase: DropCase): void {
    this._dropCase$.next(dropCase);
  }
  clearDropCase(): void {
    this._dropCase$.next(undefined);
  }

  focus(handle: Handle) {
    this._focused$.next(handle);
  }
  blur(handle: Handle) {
    const current = this._focused$.value;
    if (current === handle) {
      this._focused$.next(undefined);
    }
  }

  hover(handle: Handle) {
    this._hovered$.next(handle);
  }
  unhover(handle: Handle) {
    const current = this._hovered$.value;
    if (current === handle) {
      this._hovered$.next(undefined);
    }
  }

  private _normalizeSelection(selection: Handle[]) {
    let selectedHandles = _.uniq(
      [...selection].filter((h) => h.property(handleProperties.isSelectable))
    );

    if (selectedHandles.length === 0) return selectedHandles;

    // only allow seletion of the same root type
    const byType = _.groupBy(selectedHandles, (handle) => handle.type);
    for (const rootType of typeSelectionPredecence) {
      if (byType[rootType]?.length) {
        selectedHandles = byType[rootType];
        break;
      }
    }

    // if elements
    // if (selectedHandles[0] instanceof ElementHandle) {
    //   // only allow selection of the parent
    //   const pathMap = new Map<string, IElementHandle>();
    //   for (const handle of selectedHandles) {
    //     const path = handle.path.join(".");
    //     pathMap.set(path, handle as IElementHandle);
    //   }
    //   // -> sort by path so that parents are before children
    //   const sortedPaths = [...pathMap.keys()].sort();
    //   // -> filter out children
    //   let i = 1;
    //   while (i < sortedPaths.length) {
    //     const previousPath = sortedPaths[i - 1];
    //     const currentPath = sortedPaths[i];
    //     if (currentPath.startsWith(previousPath)) {
    //       sortedPaths.splice(i, 1);
    //     } else {
    //       ++i;
    //     }
    //   }

    //   selectedHandles = sortedPaths.map((path) => pathMap.get(path)!);
    // }

    return selectedHandles;
  }
  select(handles: Handle[], { toggle }: { toggle?: boolean } = {}) {
    let newSelection: Handle[] = [];
    if (toggle) {
      const currentSelection = new Set(this._selection$.value);
      for (const handle of handles) {
        if (currentSelection.has(handle)) {
          currentSelection.delete(handle);
        } else {
          currentSelection.add(handle);
        }
      }
      newSelection = this._normalizeSelection([...currentSelection]);
    } else {
      newSelection = this._normalizeSelection(handles);
    }
    this._selection$.next(newSelection);
  }
  deselect(handles: Handle[]) {
    this._selection$.next(
      this._selection$.value.filter((handle) => !handles.includes(handle))
    );
  }
  clearSelection() {
    this._selection$.next([]);
  }
  clearFocus() {
    this._focused$.next(undefined);
  }
}

const typeSelectionPredecence = [
  handleTypes.frame,
  handleTypes.element,
  handleTypes.slot,
  handleTypes.connection,
];
