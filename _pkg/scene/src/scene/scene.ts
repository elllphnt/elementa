import { Component, Project } from "@elllphnt/elementa-models";
import { Disposable, pairwiseOrEmpty } from "@elllphnt/elementa-utils";
import { Subscription } from "rxjs";
import { DomStyleSheetManager } from "../style/_";

type RefCountedSubscription = {
  refCount: number;
  subscription: Subscription;
};

/**
 * Scene manages global rendering context such as stylesheet lifecycles.
 * It tracks registered components and projects, ensuring stylesheets are
 * injected and removed efficiently as components are mounted and unmounted.
 */
export class Scene extends Disposable {
  readonly stylesheetDomManager: DomStyleSheetManager;

  private readonly _projects = new Map<Project, RefCountedSubscription>();
  private readonly _components = new Map<Component, RefCountedSubscription>();

  constructor({
    stylesheetManager,
  }: {
    stylesheetManager: DomStyleSheetManager;
  }) {
    super();
    this.stylesheetDomManager = stylesheetManager;

    this.addDisposer(() => {
      for (const { subscription } of this._projects.values())
        subscription.unsubscribe();
      for (const { subscription } of this._components.values())
        subscription.unsubscribe();
      this._projects.clear();
      this._components.clear();
    });
  }

  registerProject(project: Project): void {
    const existing = this._projects.get(project);
    if (existing) {
      existing.refCount++;
      return;
    }

    const subscription = project.styleManager.stylesheets$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        next.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).useRef(document)
        );
        prev?.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).clearRef(document)
        );
      });

    this._projects.set(project, { refCount: 1, subscription });
  }

  unregisterProject(project: Project): void {
    const tracked = this._projects.get(project);
    if (!tracked) return;

    if (--tracked.refCount === 0) {
      tracked.subscription.unsubscribe();
      this._projects.delete(project);
    }
  }

  registerComponent(component: Component): void {
    const existing = this._components.get(component);
    if (existing) {
      existing.refCount++;
      return;
    }

    const subscription = component.allStylesheets$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        next.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).useRef(document)
        );
        prev?.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).clearRef(document)
        );
      });

    this._components.set(component, { refCount: 1, subscription });
    this.registerProject(component.project);
  }

  unregisterComponent(component: Component): void {
    const tracked = this._components.get(component);
    if (!tracked) return;

    if (--tracked.refCount === 0) {
      tracked.subscription.unsubscribe();
      this._components.delete(component);
      this.unregisterProject(component.project);
    }
  }
}
