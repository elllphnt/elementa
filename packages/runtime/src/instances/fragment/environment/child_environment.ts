import { StyleModifierData } from "@elllphnt/elementa-base";
import { DataInput, SlotFill } from "@elllphnt/elementa-models";
import { Observable } from "rxjs";
import { StateInstance } from "../../states/_.js";
import { FragmentInstance } from "../fragment.js";
import { FragmentEnvironment } from "./environment.js";

/**
 * ChildFragmentEnvironment provides a base implementation for environment hierarchies.
 * It delegates all methods to the parent environment by default, allowing
 * subclasses to selectively override specific behaviors while maintaining
 * the inheritance chain of the environment context.
 */
export class ChildFragmentEnvironment extends FragmentEnvironment {
  protected parent: FragmentEnvironment;

  constructor({ parent }: { parent: FragmentEnvironment }) {
    super({ runtime: parent.runtime });
    this.parent = parent;
  }

  // Component stack delegation
  get fragmentStack(): string[] {
    return this.parent.fragmentStack;
  }

  get fragmentStack$(): Observable<string[]> {
    return this.parent.fragmentStack$;
  }

  // Style modifiers delegation
  get styleModifiers(): StyleModifierData[] {
    return this.parent.styleModifiers;
  }

  get styleModifiers$(): Observable<StyleModifierData[]> {
    return this.parent.styleModifiers$;
  }

  // States delegation
  get states(): StateInstance[] {
    return this.parent.states;
  }

  get states$(): Observable<StateInstance[]> {
    return this.parent.states$;
  }

  // Props delegation
  get props(): DataInput[] {
    return this.parent.props;
  }

  get props$(): Observable<DataInput[]> {
    return this.parent.props$;
  }

  // Slot fill delegation
  slotFill(id: string): SlotFill | undefined {
    return this.parent.slotFill(id);
  }

  slotFill$(id: string): Observable<SlotFill | undefined> {
    return this.parent.slotFill$(id);
  }

  // Fragments delegation
  get fragments(): FragmentInstance[] {
    return this.parent.fragments;
  }

  get fragments$(): Observable<FragmentInstance[]> {
    return this.parent.fragments$;
  }

  // Prop value delegation
  propValue(varName: string): unknown {
    return this.parent.propValue(varName);
  }

  propValue$(varName: string): Observable<unknown> {
    return this.parent.propValue$(varName);
  }

  // Param value delegation
  paramValue(varName: string): unknown {
    return this.parent.paramValue(varName);
  }

  paramValue$(varName: string): Observable<unknown> {
    return this.parent.paramValue$(varName);
  }
}
