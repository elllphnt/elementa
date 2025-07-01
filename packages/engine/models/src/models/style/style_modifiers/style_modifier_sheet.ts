import {
    StyleModifierDefinitionData,
    StyleModifierSheetData,
} from "@elllphnt/elementa-base";
import { RecordState } from "@elllphnt/elementa-kernel";
import { map, Observable } from "rxjs";
import { ProjectModel } from "~/models/project.js";
import { Project } from "~/project/project.js";

export class StyleModifierSheet extends ProjectModel<
  RecordState<StyleModifierSheetData>
> {
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
    project,
    initialized,
  }: {
    state: RecordState<StyleModifierSheetData>;
    project: Project;
    initialized?: boolean;
  }) {
    super({ state, project });
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
