import {
  StyleModifierDefinitionData,
  StyleModifierSheetData,
} from "@elllphnt/elementa-base";
import { Model, RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { File } from "~/project/file/file.js";
import { Project } from "~/project/project.js";

export class StyleModifierSheet extends Model<
  RecordState<StyleModifierSheetData>
> {
  project: Project;
  file: File;

  get modifiers(): StyleModifierDefinitionData[] {
    return this.state.entry("modifiers") || [];
  }
  get modifiers$(): Observable<StyleModifierDefinitionData[]> {
    return this.state
      .entry$("modifiers")
      .pipe(map((modifiers) => modifiers || []));
  }

  constructor({
    state,
    file,
  }: {
    state: RecordState<StyleModifierSheetData>;
    file: File;
  }) {
    super({ state });

    this.project = file.project;
    this.file = file;
  }

  addModifier(definition: StyleModifierDefinitionData): void {
    const modifiers = [...this.modifiers, definition];
    this.state.set("modifiers", modifiers);
  }
  removeModifier(id: string): void {
    const modifiers = this.modifiers.filter((modifier) => modifier.id !== id);
    this.state.set("modifiers", modifiers);
  }
}
