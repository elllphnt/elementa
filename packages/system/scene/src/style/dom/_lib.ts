import {
  CssStyleSheet,
  cssStyleSheetTypes,
  RuleCssStyleSheet,
  TextCssStyleSheet,
} from "@elllphnt/elementa-core";
import { RuleDomStyleSheetAdaptor } from "./adaptors/rule/rule.js";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet.js";
import { TextDomStyleSheetAdaptor } from "./adaptors/text.js";

export function createDomStyleSheetAdaptor({
  stylesheet,
}: {
  stylesheet: CssStyleSheet;
}): DomStyleSheetAdaptor {
  switch (stylesheet.type) {
    case cssStyleSheetTypes.rule:
      return new RuleDomStyleSheetAdaptor({
        styleSheet: stylesheet as RuleCssStyleSheet,
      });
    case cssStyleSheetTypes.text:
      return new TextDomStyleSheetAdaptor({
        styleSheet: stylesheet as TextCssStyleSheet,
      });
    default:
      throw new Error(`Unknown stylesheet type: ${stylesheet.type}`);
  }
}
