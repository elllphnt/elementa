import type { Root } from "postcss";
import postcss from "postcss";

/**
 * Escape a string for use in a JS RegExp.
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

/**
 * Generate a regex to match a base selector exactly (no partial matches).
 */
export function genBaseSelectorRegex(base: string): RegExp {
  const esc = escapeRegExp(base);
  const idChar = "[A-Za-z0-9_-]";
  const idCharRegex = new RegExp(`^${idChar}$`);
  let pattern = esc;

  if (idCharRegex.test(base[0])) {
    pattern = `(?<!${idChar})${pattern}`;
  }
  if (idCharRegex.test(base[base.length - 1])) {
    pattern = `${pattern}(?!${idChar})`;
  }

  return new RegExp(pattern, "g");
}

export interface ParsedStyleRule {
  selector: string[];
  style: Record<string, string>;
}

export interface ParsedClassSheet {
  /** The ID (without #) or class (without .) that this sheet represents */
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
  /** ID-scoped styles */
  ids: ParsedClassSheet[];
  /** Unscoped class-based styles */
  classes: ParsedClassSheet[];
  /** Keyframes definitions */
  keyframes: ParsedKeyFrameSetData[];
}

export function parseCssModule(css: string): ParsedCssModule {
  const root = postcss.parse(css) as Root;
  const idRulesMap: Record<string, ParsedStyleRule[]> = {};
  const classRulesMap: Record<string, ParsedStyleRule[]> = {};
  const keyframes: ParsedKeyFrameSetData[] = [];

  function addRule(
    map: Record<string, ParsedStyleRule[]>,
    name: string,
    rule: ParsedStyleRule,
  ) {
    if (!Object.keys(rule.style).length) return;
    (map[name] ??= []).push(rule);
  }

  function processNode({
    node,
    contextId,
    isClass,
    selectorChain,
  }: {
    node: postcss.ChildNode;
    contextId?: string;
    isClass?: boolean;
    selectorChain?: string[];
  }) {
    if (node.type === "rule") {
      node.selectors.forEach((rawSel) => {
        let id = contextId;
        let isMClass = isClass ?? false;
        let sel = rawSel;

        // Detect and extract ID
        const mId = sel.match(/#([A-Za-z0-9_-]+)/);
        if (mId) {
          id = mId[1];
          sel = sel.replace(genBaseSelectorRegex(`#${id}`), "&");
          isMClass = false;
        }

        // If no ID scope, detect class for global grouping
        if (!id) {
          const mClass = sel.match(/\.([A-Za-z0-9_-]+)/);
          if (mClass) {
            const cls = mClass[1];
            sel = sel.replace(genBaseSelectorRegex(`.${cls}`), "&");
            contextId = undefined;
            isMClass = true;
            id = cls;
          }
        }

        const upstreamChain = mId ? [] : selectorChain || [];
        const newChain =
          sel !== "&" ? [...(upstreamChain || []), sel] : upstreamChain || [];
        const style: Record<string, string> = {};

        node.nodes.forEach((child) => {
          if (child.type === "decl") {
            style[child.prop] = child.value;
          } else if (child.type === "rule" || child.type === "atrule") {
            processNode({
              node: child,
              contextId: id,
              selectorChain: newChain,
              isClass: isMClass,
            });
          }
        });

        if (id) {
          if (isMClass) {
            addRule(classRulesMap, id, { selector: newChain, style });
          } else {
            addRule(idRulesMap, id, { selector: newChain, style });
          }
        }
      });
    } else if (node.type === "atrule") {
      if (["media", "supports", "layer", "container"].includes(node.name)) {
        const at = `@${node.name}${node.params ? " " + node.params : ""}`;

        const newChain = [...(selectorChain || []), at];
        const style: Record<string, string> = {};

        node.nodes?.forEach((child) => {
          if (child.type === "decl") {
            style[child.prop] = child.value;
          } else if (child.type === "rule" || child.type === "atrule") {
            processNode({
              node: child,
              contextId,
              selectorChain: newChain,
              isClass,
            });
          }
        });

        if (contextId) {
          if (isClass) {
            addRule(classRulesMap, contextId, { selector: newChain, style });
          } else {
            addRule(idRulesMap, contextId, { selector: newChain, style });
          }
        }
      } else if (node.name === "keyframes") {
        const kf: ParsedKeyFrameSetData = { name: node.params, steps: [] };
        node.nodes?.forEach((frame) => {
          if (frame.type === "rule") {
            const frameStyle: Record<string, string> = {};
            frame.nodes.forEach((ch) => {
              if (ch.type === "decl") {
                frameStyle[ch.prop] = ch.value;
              }
            });
            kf.steps.push({ selector: frame.selectors, style: frameStyle });
          }
        });
        keyframes.push(kf);
      }
    }
  }

  root.nodes.forEach((n) =>
    processNode({ node: n, contextId: undefined, selectorChain: [] }),
  );

  return {
    ids: Object.entries(idRulesMap).map(([name, rules]) => ({ name, rules })),
    classes: Object.entries(classRulesMap).map(([name, rules]) => ({
      name,
      rules,
    })),
    keyframes,
  };
}
