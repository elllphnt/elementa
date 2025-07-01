import {
  CssStyleSheet,
  cssStyleSheetTypes,
  RuleCssStyleSheet,
  TextCssStyleSheet,
} from "@elllphnt/elementa-models";
import { styleLogger } from "../../loggers.js";
import { RuleDomStyleSheetAdaptor } from "./adaptors/rule/rule.js";
import { DomStyleSheetAdaptor } from "./adaptors/stylesheet.js";
import { TextDomStyleSheetAdaptor } from "./adaptors/text.js";

export function createDomStyleSheetAdaptor({
  stylesheet,
}: {
  stylesheet: CssStyleSheet;
}): DomStyleSheetAdaptor {
  styleLogger.debug("Creating DOM stylesheet adaptor", {
    type: stylesheet.type,
    target: stylesheet.target,
    key: stylesheet.key,
  });

  switch (stylesheet.type) {
    case cssStyleSheetTypes.rule:
      styleLogger.debug("Creating RuleDomStyleSheetAdaptor", {
        target: stylesheet.target,
        rulesCount: (stylesheet as RuleCssStyleSheet).rules.length,
      });
      return new RuleDomStyleSheetAdaptor({
        styleSheet: stylesheet as RuleCssStyleSheet,
      });
    case cssStyleSheetTypes.text:
      styleLogger.debug("Creating TextDomStyleSheetAdaptor", {
        target: stylesheet.target,
        textLength: (stylesheet as TextCssStyleSheet).text.length,
      });
      return new TextDomStyleSheetAdaptor({
        styleSheet: stylesheet as TextCssStyleSheet,
      });
    default:
      styleLogger.error("Unknown stylesheet type", {
        type: stylesheet.type,
        target: stylesheet.target,
      });
      throw new Error(`Unknown stylesheet type: ${stylesheet.type}`);
  }
}
