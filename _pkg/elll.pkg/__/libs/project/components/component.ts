import { elllIcons16 } from "@repo/components";
import { Component, ComponentData } from "@repo/elementa";
import { Observable, debounceTime, map, of } from "rxjs";
import { EditorContent } from "~/src/editors/content";
import { Elll } from "../../../elll/elll";
import { Content } from "../../content/content";
import { stripEmpty } from "../../utils";

export class ElllComponent extends Component implements EditorContent {
  readonly elll: Elll;
  readonly url: string;

  get content(): Content<ComponentData> {
    return this.elll.contentManager.content(this.url, "json");
  }

  get name(): string {
    return this.content.name ?? "";
  }
  get name$(): Observable<string> {
    return this.content.name$.pipe(map((name) => name ?? ""));
  }

  get icon(): string {
    return elllIcons16.component;
  }
  get icon$(): Observable<string> {
    return of(elllIcons16.component);
  }

  get color(): string {
    return "";
  }
  get color$(): Observable<string> {
    return of("");
  }

  get loading() {
    return !this.content.loaded;
  }
  get loading$() {
    return this.content.loaded$.pipe(map((loaded) => !loaded));
  }

  get loaded() {
    return this.content.loaded;
  }
  get loaded$() {
    return this.content.loaded$;
  }

  constructor({ url, elll }: { url: string; elll: Elll }) {
    super({ id: url, project: elll.project });
    this.url = url;
    this.elll = elll;

    // load the component data
    const dataSubscription = this.content.data$.subscribe((data) => {
      console.log("restoring", data);
      this.restore({
        ...data,
        _id: this.id,
      });
    });
    // save the component data
    const saveSubscription = this.data$
      .pipe(debounceTime(100))
      .subscribe((data) => {
        this.content.update(stripEmpty(data));
      });

    this.addDisposer(() => {
      dataSubscription.unsubscribe();
      saveSubscription.unsubscribe();
    });
  }

  save() {
    this.content.update(stripEmpty(this.data));
  }
}
