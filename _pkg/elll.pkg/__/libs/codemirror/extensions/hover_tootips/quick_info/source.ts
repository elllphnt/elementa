import { highlightingFor } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { tsVirtualEnvironment } from "../../../facets/ts_env";
import { HoverSource } from "../_type";

function getTagForTsKind(kind: string) {
  switch (kind) {
    case "aliasName":
      return t.variableName;
    case "className":
      return t.className;
    case "enumName":
      return t.typeName;
    case "fieldName":
      return t.propertyName;
    case "interfaceName":
      return t.typeName;
    case "keyword":
      return t.keyword;
    case "lineBreak":
      return t.separator;
    case "numericLiteral":
      return t.number;
    case "stringLiteral":
      return t.string;
    case "localName":
      return t.variableName;
    case "methodName":
      return t.function(t.variableName);
    case "moduleName":
      return t.namespace;
    case "operator":
      return t.operator;
    case "parameterName":
      return t.name;
    case "propertyName":
      return t.propertyName;
    case "punctuation":
      return t.punctuation;
    case "space":
      return t.separator;
    case "text":
      return t.string;
    case "typeParameterName":
      return t.typeName;
    case "enumMemberName":
      return t.propertyName;
    case "functionName":
      return t.function(t.variableName);
    case "regularExpressionLiteral":
      return t.regexp;
    case "link":
      return t.link;
    case "linkName":
      return t.link;
    case "linkText":
      return t.link;
    default:
      return undefined;
  }
}
export const quickInfoHoverSource: HoverSource = (view, pos, side) => {
  const ts = view.state.facet(tsVirtualEnvironment);

  const env = ts?.getEnvironment();
  const fileName = ts?.getCurrentFileName();

  if (!fileName || !env) return null;

  // calculate the range of the word
  let { from, to, text } = view.state.doc.lineAt(pos);
  let start = pos,
    end = pos;
  while (start > from && /\w/.test(text[start - from - 1])) start--;
  while (end < to && /\w/.test(text[end - from])) end++;

  const info = env.languageService.getQuickInfoAtPosition(fileName, start);
  if (!info?.displayParts) return null;

  const dom = document.createElement("pre");
  dom.style.whiteSpace = "pre-wrap";
  const parts = info.displayParts.map((part) => {
    const span = document.createElement("span");
    span.textContent = part.text;
    if (["punctuation", "space", "lineBreak", "operator"].includes(part.kind)) {
      const possibleBreak = document.createElement("wbr");
      span.prepend(possibleBreak);
    }
    const tag = getTagForTsKind(part.kind);
    if (tag) {
      const className = highlightingFor(view.state, [tag]);
      if (className) {
        span.className = className;
      }
    } else {
    }
    return span;
  });

  dom.append(...parts);

  return {
    pos: start,
    end,
    above: true,
    create(view) {
      return { dom };
    },
  };
};
