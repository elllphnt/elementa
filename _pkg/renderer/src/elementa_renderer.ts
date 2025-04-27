import { Component, Project } from "@elllphnt/elementa-models";
import { Disposable, pairwiseOrEmpty } from "@elllphnt/elementa-utils";
import { Elementa } from "@repo/elementa";
import { Subscription } from "rxjs";
import { DomStyleSheetManager } from "./style/dom/manager";

export abstract class ElementaRenderer extends Disposable {
  readonly elementa: Elementa;
  readonly stylesheetDomManager: DomStyleSheetManager;

  private _renderedComponents = new Map<
    Component,
    {
      refCount: number;
      sytlesheetSubscription: Subscription;
    }
  >();
  private _renderedProject = new Map<
    Project,
    {
      refCount: number;
      sytlesheetSubscription: Subscription;
    }
  >();

  constructor({
    elementa,
    stylesheetManager,
  }: {
    elementa: Elementa;
    stylesheetManager: DomStyleSheetManager;
  }) {
    super();
    this.elementa = elementa;
    this.stylesheetDomManager = stylesheetManager;

    this.addDisposer(() => {
      this._renderedComponents.forEach((details) => {
        details.sytlesheetSubscription.unsubscribe();
      });
      this._renderedComponents.clear();
      this._renderedProject.forEach((details) => {
        details.sytlesheetSubscription.unsubscribe();
      });
      this._renderedProject.clear();
    });
  }

  registerProject(project: Project) {
    const details = this._renderedProject.get(project);
    if (details?.refCount) {
      this._renderedProject.set(project, {
        refCount: details.refCount + 1,
        sytlesheetSubscription: details.sytlesheetSubscription,
      });
    } else {
      this._renderedProject.set(project, {
        refCount: 1,
        sytlesheetSubscription: project.styleManager.stylesheets$
          .pipe(pairwiseOrEmpty())
          .subscribe(([prev, next]) => {
            // add new stylesheets first to avoid removing stylesheets that are still in use
            next.forEach((stylesheet) => {
              const adaptor =
                this.stylesheetDomManager.stylesheetAdaptor(stylesheet);
              adaptor.useRef(document);
            });
            prev?.forEach((stylesheet) => {
              const adaptor =
                this.stylesheetDomManager.stylesheetAdaptor(stylesheet);
              adaptor.clearRef(document);
            });
          }),
      });
    }
  }
  unregisterProject(project: Project) {
    const details = this._renderedProject.get(project);
    if (details) {
      if (details.refCount === 1) {
        details.sytlesheetSubscription.unsubscribe();
        this._renderedProject.delete(project);
      } else {
        this._renderedProject.set(project, {
          refCount: details.refCount - 1,
          sytlesheetSubscription: details.sytlesheetSubscription,
        });
      }
    }
  }

  registerComponent(component: Component) {
    const details = this._renderedComponents.get(component);
    if (details?.refCount) {
      this._renderedComponents.set(component, {
        refCount: details.refCount + 1,
        sytlesheetSubscription: details.sytlesheetSubscription,
      });
    } else {
      this._renderedComponents.set(component, {
        refCount: 1,
        sytlesheetSubscription: component.allStylesheets$
          .pipe(pairwiseOrEmpty())
          .subscribe(([prev, next]) => {
            // add new stylesheets first to avoid removing stylesheets that are still in use
            next.forEach((stylesheet) => {
              const adaptor =
                this.stylesheetDomManager.stylesheetAdaptor(stylesheet);
              adaptor.useRef(document);
            });
            prev?.forEach((stylesheet) => {
              const adaptor =
                this.stylesheetDomManager.stylesheetAdaptor(stylesheet);
              adaptor.clearRef(document);
            });
          }),
      });
      this.registerProject(component.project);
    }
  }
  unregisterComponent(component: Component) {
    const details = this._renderedComponents.get(component);
    if (details) {
      if (details.refCount === 1) {
        details.sytlesheetSubscription.unsubscribe();
        this._renderedComponents.delete(component);
        this.unregisterProject(component.project);
      } else {
        this._renderedComponents.set(component, {
          refCount: details.refCount - 1,
          sytlesheetSubscription: details.sytlesheetSubscription,
        });
      }
    }
  }
}
