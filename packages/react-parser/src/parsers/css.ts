import postcss, { AtRule, Declaration, Rule } from "postcss";

export type StyleData = Record<string, string>;
export type CssSelector = string[];

export type KeyFrameData = {
  offset: number;
  style: StyleData;
};
export type KeyFrameSetData = {
  name: string;
  keyframes: KeyFrameData[];
};

export type StyleRule = {
  selector: string;
  style: StyleData;
};

export type CssModule = {
  styles?: StyleRule[];
  keyframeSets?: KeyFrameSetData[];
};

export function parseCssModule(css: string): CssModule {
  const root = postcss.parse(css);

  const styles: StyleRule[] = [];
  const keyframeSets: KeyFrameSetData[] = [];

  root.walk((node) => {
    if (node.type === "rule") {
      const rule = node as Rule;
      const style: StyleData = {};

      rule.walkDecls((decl: Declaration) => {
        style[decl.prop] = decl.value;
      });

      styles.push({
        selector: rule.selector,
        style,
      });
    }

    if (node.type === "atrule" && node.name === "keyframes") {
      const atRule = node as AtRule;
      const frames: KeyFrameData[] = [];

      atRule.walkRules((frameRule) => {
        const offsetRaw = frameRule.selector;
        const style: StyleData = {};

        frameRule.walkDecls((decl: Declaration) => {
          style[decl.prop] = decl.value;
        });

        for (const part of offsetRaw.split(",")) {
          const trimmed = part.trim();
          let offset = parseFloat(trimmed.replace("%", "")) / 100;
          if (trimmed === "from") offset = 0;
          if (trimmed === "to") offset = 1;

          frames.push({ offset, style });
        }
      });

      keyframeSets.push({
        name: atRule.params,
        keyframes: frames,
      });
    }
  });

  return {
    styles: styles.length ? styles : undefined,
    keyframeSets: keyframeSets.length ? keyframeSets : undefined,
  };
}
