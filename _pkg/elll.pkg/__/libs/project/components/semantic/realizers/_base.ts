import {
  SemanticElementData,
  SemanticGridLayoutData,
  SemanticStackLayoutData,
} from "@elllphnt/elll-intelligence";
import {
  ContainerElementData,
  ElementData,
  ElementStyleData,
} from "@repo/elementa";
import { realizeSemanticElement } from "../realize";
import {
  applySemanticTextStyle,
  convertSemanticColor,
  convertSemanticContextualData,
  convertSemanticSize,
  convertSemanticSpace,
  setSemanticContextualValue,
} from "./_utils";

export function baseElementRealizer(
  semantic: SemanticElementData,
  {
    type,
  }: {
    type: string;
  },
): ElementData {
  const element: ElementData = {
    type,
    name: semantic.name,
  };

  let style: ElementStyleData = {};

  // size

  if (semantic.height) {
    style.height = convertSemanticSize(semantic.height);
  }
  if (semantic.width) {
    style.width = convertSemanticSize(semantic.width);
  }
  if (semantic.heightConstraints?.min) {
    style["min-height"] = convertSemanticSize(
      semantic.heightConstraints.min,
    ) as any;
  }
  if (semantic.heightConstraints?.max) {
    style["max-height"] = convertSemanticSize(
      semantic.heightConstraints.max,
    ) as any;
  }
  if (semantic.widthConstraints?.min) {
    style["min-width"] = convertSemanticSize(
      semantic.widthConstraints.min,
    ) as any;
  }
  if (semantic.widthConstraints?.max) {
    style["max-width"] = convertSemanticSize(
      semantic.widthConstraints.max,
    ) as any;
  }

  element.style = style;

  // fill
  convertSemanticContextualData(semantic.fill, (fill, context) => {
    switch (fill?.type) {
      case "color": {
        setSemanticContextualValue({
          target: element.style!,
          key: "background",
          value: convertSemanticColor(fill.color),
          context,
        });
        break;
      }
    }
  });

  // layout
  convertSemanticContextualData(semantic.layout, (layout, context) => {
    switch (layout?.type) {
      case "stack": {
        const stack = layout as SemanticStackLayoutData;
        setSemanticContextualValue({
          target: element.style!,
          key: "layout",
          value: "flex",
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "flex-direction",
          value: stack.direction,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "gap-x",
          value: convertSemanticSpace(stack.gap),
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "gap-y",
          value: convertSemanticSpace(stack.gap),
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "align-items",
          value: stack.align,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "justify-content",
          value: stack.justify,
          context,
        });
        break;
      }
      case "grid": {
        const grid = layout as SemanticGridLayoutData;
        setSemanticContextualValue({
          target: element.style!,
          key: "layout",
          value: "grid",
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "grid-template-columns",
          value: grid.columns,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "grid-template-rows",
          value: grid.rows,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "gap-x",
          value: convertSemanticSpace(grid.gapX),
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "gap-y",
          value: convertSemanticSpace(grid.gapY),
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "align-content",
          value: grid.alignContent,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "justify-content",
          value: grid.justifyContent,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "align-items",
          value: grid.alignItems,
          context,
        });
        setSemanticContextualValue({
          target: element.style!,
          key: "justify-items",
          value: grid.justifyItems,
          context,
        });
        break;
      }
    }
  });

  // padding
  convertSemanticContextualData(semantic.padding, (padding, context) => {
    if (padding?.all) {
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-top",
        value: convertSemanticSpace(padding.all),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-right",
        value: convertSemanticSpace(padding.all),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-bottom",
        value: convertSemanticSpace(padding.all),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-left",
        value: convertSemanticSpace(padding.all),
        context,
      });
    } else if (padding?.x || padding?.y) {
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-top",
        value: convertSemanticSpace(padding.y),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-bottom",
        value: convertSemanticSpace(padding.y),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-left",
        value: convertSemanticSpace(padding.x),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-right",
        value: convertSemanticSpace(padding.x),
        context,
      });
    } else {
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-top",
        value: convertSemanticSpace(padding?.top),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-right",
        value: convertSemanticSpace(padding?.right),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-bottom",
        value: convertSemanticSpace(padding?.bottom),
        context,
      });
      setSemanticContextualValue({
        target: element.style!,
        key: "padding-left",
        value: convertSemanticSpace(padding?.left),
        context,
      });
    }
  });

  // typography
  convertSemanticContextualData(
    semantic?.typography?.style,
    (style, context) => {
      if (style) {
        applySemanticTextStyle(style, (key, value) => {
          setSemanticContextualValue({
            target: element.style!,
            key,
            value,
            context,
          });
        });
      }
    },
  );
  convertSemanticContextualData(
    (semantic?.typography as any)?.color,
    (color, context) => {
      if (color) {
        setSemanticContextualValue({
          target: element.style!,
          key: "color",
          value: convertSemanticColor(color),
          context,
        });
      }
    },
  );

  //  children
  if (semantic.children) {
    (element as ContainerElementData).children = semantic.children
      .map((child) => realizeSemanticElement(child))
      .filter(Boolean) as ElementData[];
  }

  return element;
}
