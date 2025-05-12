import { TemplateData } from "@elllphnt/elementa-base";
import { Observable } from "rxjs";
import { CssStyleSheet } from "../../../css/_.js";
import { Component } from "../../_interfaces/component/component.js";
import { FragmentVariant } from "../../_interfaces/component/fragment.js";
import { Template } from "../../_interfaces/component/template.js";
import { FragmentModel } from "./fragment.js";

export class TemplateModel extends FragmentModel implements Template {
  constructor({
    init,
    component,
    cssStyleSheet,
  }: {
    init: TemplateData;
    component: Component;
    cssStyleSheet: CssStyleSheet;
  }) {
    super({
      init,
      component,
      cssStyleSheet,
      variant: FragmentVariant.Template,
    });
  }

  get name(): string {
    return this._state.record.name || "Template";
  }

  get name$(): Observable<string> {
    return this._state.entry$("name");
  }
}
