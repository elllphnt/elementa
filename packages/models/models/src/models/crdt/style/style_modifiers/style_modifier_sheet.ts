import { ensureField } from "@elllphnt/crdt";
import {
  StyleModifierDefinitionData,
  StyleModifierSheetData,
} from "@elllphnt/elementa-base";
import { File, Project, StyleModifierSheet } from "@elllphnt/elementa-core";
import {
  CrdtModel,
  CrdtRecordState,
  keyManager,
} from "@elllphnt/elementa-utils";
import { map, Observable } from "rxjs";
import * as y from "yjs";

export class CrdtStyleModifierSheet
  extends CrdtModel<y.Map<any>>
  implements StyleModifierSheet
{
  project: Project;
  file: File;

  private _state: CrdtRecordState<StyleModifierSheetData>;

  get modifiers(): StyleModifierDefinitionData[] {
    return this._state.entry("modifiers") || [];
  }

  get modifiers$(): Observable<StyleModifierDefinitionData[]> {
    return this._state
      .entry$("modifiers")
      .pipe(map((modifiers) => modifiers || []));
  }

  constructor({
    crdt,
    file,
    initialized,
  }: {
    crdt: y.Map<any>;
    file: File;
    initialized?: boolean;
  }) {
    super({ key: keyManager.next("style-modifier-sheet"), crdt });

    this.project = file.project;
    this.file = file;

    if (!initialized) {
      ensureField(crdt, "modifiers", () => []);
    }

    this._state = new CrdtRecordState(crdt);

    this.addDisposer(() => {
      this._state.dispose();
    });
  }

  addModifier(definition: StyleModifierDefinitionData): void {
    const modifiers = [...this.modifiers, definition];
    this._state.set("modifiers", modifiers);
  }

  removeModifier(id: string): void {
    const modifiers = this.modifiers.filter((modifier) => modifier.id !== id);
    this._state.set("modifiers", modifiers);
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtStyleModifierSheet({
      crdt,
      file: this.file,
      initialized: true,
    }) as this;
  }
}
