import { Lifecycle } from "@elllphnt/elementa-kernel";
import { pairwiseOrEmpty } from "@elllphnt/elementa-lang-utils";
import type { Component, Fragment, Project } from "@elllphnt/elementa-models";
import type { Subscription } from "rxjs";
import { styleLogger } from "../loggers.js";
import type { DomStyleSheetManager } from "../style/dom/manager.js";
import { systemStylesheet } from "./stylesheet/stylesheet.js";

type RefCountedSubscription = {
  refCount: number;
  subscription: Subscription;
};

/**
 * Scene manages global rendering context such as stylesheet lifecycles.
 * It tracks registered fragments and projects, ensuring stylesheets are
 * injected and removed efficiently as fragments are mounted and unmounted.
 */
export class Scene extends Lifecycle {
  readonly stylesheetDomManager: DomStyleSheetManager;

  private readonly _projects = new Map<Project, RefCountedSubscription>();
  private readonly _components = new Map<Component, RefCountedSubscription>();
  private readonly _fragments = new Map<Fragment, RefCountedSubscription>();

  constructor({
    stylesheetManager,
  }: {
    stylesheetManager: DomStyleSheetManager;
  }) {
    super();
    this.stylesheetDomManager = stylesheetManager;

    this.stylesheetDomManager
      .stylesheetAdaptor(systemStylesheet)
      .useRef(document);

    this.addDisposer(() => {
      for (const { subscription } of this._projects.values())
        subscription.unsubscribe();
      for (const { subscription } of this._fragments.values())
        subscription.unsubscribe();
      this._projects.clear();
      this._fragments.clear();
      this.stylesheetDomManager
        .stylesheetAdaptor(systemStylesheet)
        .clearRef(document);
    });
  }

  private _registerProject(project: Project): void {
    const existing = this._projects.get(project);
    if (existing) {
      existing.refCount++;
      return;
    }

    const subscription = project.styleManager.cssStylesheets$
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
  private _unregisterProject(project: Project): void {
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

    const subscription = component.allCssStylesheets$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        next.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).useRef(document)
        );
        prev?.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).clearRef(document)
        );
        styleLogger.debug(
          `Component ${component.url} stylesheet adaptors updated`,
          {
            component,
          }
        );
      });

    this._components.set(component, { refCount: 1, subscription });
    this._registerProject(component.project);

    styleLogger.debug(`RegisterComponent ${component.url}`, {
      component,
    });
  }
  unregisterComponent(component: Component): void {
    const tracked = this._components.get(component);
    if (!tracked) return;

    if (--tracked.refCount === 0) {
      tracked.subscription.unsubscribe();
      this._components.delete(component);
      this._unregisterProject(component.project);
    }
  }

  registerFragment(fragment: Fragment): void {
    const existing = this._fragments.get(fragment);
    if (existing) {
      existing.refCount++;
      return;
    }

    const subscription = fragment.allCssStylesheets$
      .pipe(pairwiseOrEmpty())
      .subscribe(([prev, next]) => {
        next.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).useRef(document)
        );
        prev?.forEach((s) =>
          this.stylesheetDomManager.stylesheetAdaptor(s).clearRef(document)
        );
        styleLogger.debug(
          `Fragment ${fragment.id} stylesheet adaptors updated`,
          {
            fragment,
          }
        );
      });

    this._fragments.set(fragment, { refCount: 1, subscription });
    this._registerProject(fragment.environment.project);

    styleLogger.debug(`RegisterFragment ${fragment.id}`, {
      fragment,
    });
  }
  unregisterFragment(fragment: Fragment): void {
    const tracked = this._fragments.get(fragment);
    if (!tracked) return;

    if (--tracked.refCount === 0) {
      tracked.subscription.unsubscribe();
      this._fragments.delete(fragment);
      this._unregisterProject(fragment.environment.project);
    }
  }
}
