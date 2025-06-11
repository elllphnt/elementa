import { MediaData, MediaElementData } from "@elllphnt/elementa-base";
import { MediaElement, RenderingEnvironment } from "@elllphnt/elementa-core";
import { Observable } from "rxjs";
import * as y from "yjs";
import { CrdtBaseElement } from "./_base.js";

export class CrdtMediaElement
  extends CrdtBaseElement<MediaElementData>
  implements MediaElement
{
  get media(): MediaData | undefined {
    return this._state.entry("media");
  }

  get media$(): Observable<MediaData | undefined> {
    return this._state.entry$("media");
  }

  get fit(): MediaElementData["fit"] | undefined {
    return this._state.entry("fit");
  }

  get fit$(): Observable<MediaElementData["fit"] | undefined> {
    return this._state.entry$("fit");
  }

  get position(): MediaElementData["position"] | undefined {
    return this._state.entry("position");
  }

  get position$(): Observable<MediaElementData["position"] | undefined> {
    return this._state.entry$("position");
  }

  constructor({
    crdt,
    environment,
    initialized,
  }: {
    crdt: y.Map<any>;
    environment: RenderingEnvironment;
    initialized?: boolean;
  }) {
    super({ crdt, type: "media", environment, initialized });
  }

  protected factory(crdt: y.Map<any>): this {
    return new CrdtMediaElement({
      crdt,
      environment: this.environment,
      initialized: true,
    }) as this;
  }
}
