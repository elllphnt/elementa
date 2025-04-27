import {
  BaseElementData,
  ElementRepeatData,
  Evaluable,
  Expression,
  LinkData,
  ResolvableOrEvaluable,
} from "@elllphnt/elll-element";
import { distinctUntilChanged, map, Observable, of } from "rxjs";
import * as y from "yjs";
import { CssStyleSheet } from "~/src/css/_";
import { StylesheetCssStyleSheet } from "~/src/css/stylesheets/stylesheet/stylesheet";
import { Stylesheet } from "~/src/style/_";
import { Component } from "../component";
import { IdentifiableModel } from "../identifiable";

export abstract class Element<
  D extends BaseElementData = BaseElementData,
> extends IdentifiableModel<D> {
  readonly component: Component;
  readonly cssStyleSheet: StylesheetCssStyleSheet;

  get allCssStylesheets(): CssStyleSheet[] {
    return [this.cssStyleSheet];
  }
  get allCssStylesheets$(): Observable<CssStyleSheet[]> {
    return of([this.cssStyleSheet]);
  }

  get type() {
    return this.state.type;
  }

  get name() {
    return this.state.name;
  }
  get name$() {
    return this.state$.pipe(
      map((data) => data.name),
      distinctUntilChanged(),
    );
  }

  get tag() {
    return this.state.tag;
  }
  get tag$() {
    return this.state$.pipe(
      map((data) => data.tag),
      distinctUntilChanged(),
    );
  }

  get repeat() {
    return this.state.repeat;
  }
  get repeat$() {
    return this.state$.pipe(
      map((data) => data.repeat),
      distinctUntilChanged(),
    );
  }

  get condition() {
    return this.state.condition;
  }
  get condition$() {
    return this.state$.pipe(
      map((data) => data.condition),
      distinctUntilChanged(),
    );
  }

  get interactions() {
    return this.state.interactions;
  }
  get interactions$() {
    return this.state$.pipe(
      map((data) => data.interactions),
      distinctUntilChanged(),
    );
  }

  get link() {
    return this.state.link;
  }
  get link$() {
    return this.state$.pipe(
      map((data) => data.link),
      distinctUntilChanged(),
    );
  }

  get ariaLabel() {
    return this.state.ariaLabel;
  }
  get ariaLabel$() {
    return this.state$.pipe(
      map((data) => data.ariaLabel),
      distinctUntilChanged(),
    );
  }

  get ariaHidden() {
    return this.state.ariaHidden;
  }
  get ariaHidden$() {
    return this.state$.pipe(
      map((data) => data.ariaHidden),
      distinctUntilChanged(),
    );
  }

  get ariaRole() {
    return this.state.ariaRole;
  }
  get ariaRole$() {
    return this.state$.pipe(
      map((data) => data.ariaRole),
      distinctUntilChanged(),
    );
  }

  get tabIndex() {
    return this.state.tabIndex;
  }
  get tabIndex$() {
    return this.state$.pipe(
      map((data) => data.tabIndex),
      distinctUntilChanged(),
    );
  }

  constructor(ymap: y.Map<any>, component: Component) {
    super(ymap);
    this.component = component;
    this.cssStyleSheet = new StylesheetCssStyleSheet({
      target: `${this.type}:${this.id}`,
      stylesheet: new Stylesheet({
        project: component.project,
      }),
    });

    this.addDisposer(() => {
      this.cssStyleSheet.dispose();
    });
  }

  setLink(link: LinkData | undefined) {
    this.patch({
      link,
    } as Partial<D>);
  }

  setName(name: string) {
    this.patch({ name } as Partial<D>);
  }

  setTag(tag: string) {
    this.patch({ tag } as Partial<D>);
  }

  setRepeat(repeat: ElementRepeatData) {
    this.patch({ repeat } as Partial<D>);
  }

  setCondition(condition: Evaluable<boolean>) {
    this.patch({ condition } as Partial<D>);
  }

  setInteraction(key: string, interaction: Expression) {
    const interactions = { ...this.interactions };
    interactions[key] = interaction;
    this.patch({ interactions } as Partial<D>);
  }
  clearInteractions() {
    this.patch({ interactions: {} } as Partial<D>);
  }

  setAriaLabel(ariaLabel: ResolvableOrEvaluable<string>) {
    this.patch({ ariaLabel } as Partial<D>);
  }

  setAriaHidden(ariaHidden: ResolvableOrEvaluable<boolean>) {
    this.patch({ ariaHidden } as Partial<D>);
  }

  setAriaRole(ariaRole: ResolvableOrEvaluable<string>) {
    this.patch({ ariaRole } as Partial<D>);
  }

  setTabIndex(tabIndex: ResolvableOrEvaluable<number>) {
    this.patch({ tabIndex } as Partial<D>);
  }
}
