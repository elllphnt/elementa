import type { Root } from "postcss";
import postcss from "postcss";

/**
 * Escape a string for use in a JS RegExp.
 */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function genBaseSelectorRegex(base: string) {
  const esc = escapeRegExp(base);
  const idChar = "[A-Za-z0-9_-]";
  // Don’t use the global flag when testing single chars:
  const idCharRegex = new RegExp(`^${idChar}$`);

  let pattern = esc;

  // only assert “not preceded by ident” if base begins with an ident char
  if (idCharRegex.test(base[0])) {
    pattern = `(?<!${idChar})${pattern}`;
  }
  // only assert “not followed by ident” if base ends with an ident char
  if (idCharRegex.test(base[base.length - 1])) {
    pattern = `${pattern}(?!${idChar})`;
  }

  return new RegExp(pattern, "g");
}

export interface ParsedStyleRule {
  /** e.g. ["@media(...)", ":hover", ".child"] or ["div.&"] or [] */
  selector: string[];
  style: Record<string, string>;
}

export interface ParsedClassSheet {
  name: string;
  rules: ParsedStyleRule[];
}

export type ParsedKeyFrameStep = {
  selector: string[];
  style: Record<string, string>;
};

export type ParsedKeyFrameSetData = {
  name: string;
  steps: ParsedKeyFrameStep[];
};

export interface ParsedCssModule {
  classes: ParsedClassSheet[];
  keyframes: ParsedKeyFrameSetData[];
}

export function parseCssModule(css: string): ParsedCssModule {
  const root = postcss.parse(css) as Root;
  const classRulesMap: Record<string, ParsedStyleRule[]> = {};
  const keyframeSets: ParsedKeyFrameSetData[] = [];

  function addRule(className: string, rule: ParsedStyleRule) {
    if (!Object.keys(rule.style).length) return;
    (classRulesMap[className] ??= []).push(rule);
  }

  function processNode({
    node,
    contextClass,
    selector,
  }: {
    node: postcss.ChildNode;
    contextClass?: string;
    selector?: string[];
  }) {
    if (node.type === "rule") {
      node.selectors.forEach((sel) => {
        let cls = contextClass;
        let sub = sel;
        if (!cls) {
          const m = sel.match(/\.([A-Za-z0-9_-]+)/);
          cls = m ? m[1] : undefined;

          sub = sel.replace(genBaseSelectorRegex(`.${cls}`), "&");
        }

        const selectorChain =
          sub !== "&" ? [...(selector || []), sub] : selector || [];
        const style: Record<string, string> = {};

        node.nodes.forEach((ch) => {
          if (ch.type === "decl") style[ch.prop] = ch.value;
          if (ch.type === "rule" || ch.type === "atrule") {
            processNode({
              node: ch,
              contextClass: cls,
              selector: selectorChain,
            });
          }
        });

        if (cls) {
          addRule(cls, { selector: selectorChain, style });
        }
      });
    } else if (node.type === "atrule") {
      // only @media, @supports, @layer, @container
      if (["media", "supports", "layer", "container"].includes(node.name)) {
        const at = `@${node.name}${node.params ? " " + node.params : ""}`;
        node.nodes?.forEach((child) =>
          processNode({
            node: child,
            contextClass: contextClass,
            selector: [...(selector || []), at],
          })
        );
      } else if (node.name === "keyframes") {
        const kf: ParsedKeyFrameSetData = { name: node.params, steps: [] };
        node.nodes?.forEach((frame) => {
          if (frame.type === "rule") {
            const frameStyle: Record<string, string> = {};
            frame.nodes.forEach((ch) => {
              if (ch.type === "decl") frameStyle[ch.prop] = ch.value;
            });
            kf.steps.push({
              selector: frame.selectors,
              style: frameStyle,
            });
          }
        });
        keyframeSets.push(kf);
      }
    }
  }

  root.nodes.forEach((n) =>
    processNode({
      node: n,
      contextClass: undefined,
      selector: [],
    })
  );

  return {
    classes: Object.entries(classRulesMap).map(([name, rules]) => ({
      name,
      rules,
    })),
    keyframes: keyframeSets,
  };
}
