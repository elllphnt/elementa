import {
  CssStyleSheet,
  cssStyleSheetTypes,
  RuleCssStyleSheet,
  TextCssStyleSheet,
} from "@repo/elementa-models";
import { RuleDomStyleSheetAdaptor } from "./adaptors/rule/rule";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet";
import { TextDomStyleSheetAdaptor } from "./adaptors/text";

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
