import {
  ControlButton,
  elllIcons16,
  Icon,
  mixed,
  resolveCommonValue,
  useControlMenu,
} from "@repo/components";
import {
  ColorData,
  Expression,
  isExpression,
  Style,
  StyleData,
} from "@repo/elementa";
import { useStylesCommonPropertyValue } from "../../../../hooks/elementa/style";
import { borderControlViews } from "./_views";

function BorderControlIcon({
  color,
}: {
  color: ColorData | symbol | Expression | VarRef | undefined;
}) {
  if (typeof color === "string") {
    return (
      <div
        className="el-h-5 el-w-5 el-rounded el-border"
        style={{ backgroundColor: color }}
      />
    );
  } else if (isExpression(color)) {
    return <Icon name={elllIcons16.state} />;
  } else if (isVarRef(color)) {
    return <Icon name={elllIcons16.variable} />;
  } else {
    return <Icon name={elllIcons16.border} />;
  }
}
function BorderControlLabel({
  style,
  width,
}: {
  style: string | symbol | Expression | VarRef | undefined;
  width: number | symbol | Expression | VarRef | undefined;
}) {
  let styleText: React.ReactNode = <></>;
  let widthText: React.ReactNode = <></>;

  if (typeof style === "string") {
    styleText = style;
  } else if (style === mixed) {
    widthText = <span className="el-text-fg-300">mixed</span>;
  } else if (isExpression(style)) {
    styleText = style.__expression;
  } else if (isVarRef(style)) {
    styleText = style.__var;
  } else {
    styleText = "";
  }

  if (typeof width === "number") {
    widthText = `${width}px`;
  }
  if (typeof width === "object" && "value" in width) {
    widthText = `${width.value}${(width as any).unit}`;
  } else if (width === mixed) {
    widthText = <span className="el-text-fg-300">mixed</span>;
  } else if (isExpression(width)) {
    widthText = width.__expression;
  } else if (isVarRef(width)) {
    widthText = width.__var;
  } else {
    widthText = "";
  }

  if (styleText === widthText) {
    if (!styleText) {
      return <span className="el-text-fg-300">unset</span>;
    } else {
      return styleText;
    }
  }
  if (styleText && widthText) {
    return (
      <>
        {styleText}, {widthText}
      </>
    );
  } else {
    return (
      <>
        {styleText}
        {widthText}
      </>
    );
  }
}

export function BorderControl({ styles }: { styles: Style<StyleData>[] }) {
  const { openMenu } = useControlMenu();

  const bottomColor = useStylesCommonPropertyValue(
    styles,
    "border-bottom-color",
  );
  const topColor = useStylesCommonPropertyValue(styles, "border-top-color");
  const leftColor = useStylesCommonPropertyValue(styles, "border-left-color");
  const rightColor = useStylesCommonPropertyValue(styles, "border-right-color");

  const bottomWidth = useStylesCommonPropertyValue(
    styles,
    "border-bottom-width",
  );
  const topWidth = useStylesCommonPropertyValue(styles, "border-top-width");
  const leftWidth = useStylesCommonPropertyValue(styles, "border-left-width");
  const rightWidth = useStylesCommonPropertyValue(styles, "border-right-width");

  const bottomStyle = useStylesCommonPropertyValue(
    styles,
    "border-bottom-style",
  );
  const topStyle = useStylesCommonPropertyValue(styles, "border-top-style");
  const leftStyle = useStylesCommonPropertyValue(styles, "border-left-style");
  const rightStyle = useStylesCommonPropertyValue(styles, "border-right-style");

  const commonWidth = resolveCommonValue([
    bottomWidth,
    topWidth,
    leftWidth,
    rightWidth,
  ]);

  const commonStyle = resolveCommonValue([
    bottomStyle,
    topStyle,
    leftStyle,
    rightStyle,
  ]);

  const commonColor = resolveCommonValue([
    bottomColor,
    topColor,
    leftColor,
    rightColor,
  ]);

  const unset = !commonWidth && !commonStyle && !commonColor;

  return (
    <ControlButton
      prefix={<BorderControlIcon color={commonColor} />}
      label={
        unset ? (
          <span className="el-text-fg-300" style={{ whiteSpace: "nowrap" }}>
            Add border
          </span>
        ) : (
          <BorderControlLabel style={commonStyle} width={commonWidth} />
        )
      }
      onClick={(e) => {
        if (!commonWidth) {
          styles.forEach((style) => {
            style.setProperty("border-bottom-width", 1);
            style.setProperty("border-top-width", 1);
            style.setProperty("border-left-width", 1);
            style.setProperty("border-right-width", 1);
          });
        }

        if (!commonStyle) {
          styles.forEach((style) => {
            style.setProperty("border-bottom-style", "solid");
            style.setProperty("border-top-style", "solid");
            style.setProperty("border-left-style", "solid");
            style.setProperty("border-right-style", "solid");
          });
        }

        if (!commonColor) {
          styles.forEach((style) => {
            style.setProperty("border-bottom-color", {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            });
            style.setProperty("border-top-color", {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            });
            style.setProperty("border-left-color", {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            });
            style.setProperty("border-right-color", {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            });
          });
        }

        openMenu({
          anchor: e.currentTarget,
          title: "Border",
          viewId: borderControlViews.menu.id,
          props: { styles, indent: true },
        });
      }}
      suffix={
        unset ? (
          <></>
        ) : (
          <button
            className="el-h-5 el-w-5 el-rounded el-flex el-items-center el-justify-center hover:el-bg-fg/10 el-text-fg/50 hover:el-text-fg"
            onClick={(e) => {
              e.stopPropagation();
              styles.forEach((style) => {
                style.setProperty("border-bottom-width", undefined);
                style.setProperty("border-top-width", undefined);
                style.setProperty("border-left-width", undefined);
                style.setProperty("border-right-width", undefined);
                style.setProperty("border-bottom-style", undefined);
                style.setProperty("border-top-style", undefined);
                style.setProperty("border-left-style", undefined);
                style.setProperty("border-right-style", undefined);
                style.setProperty("border-bottom-color", undefined);
                style.setProperty("border-top-color", undefined);
                style.setProperty("border-left-color", undefined);
                style.setProperty("border-right-color", undefined);
              });
            }}
          >
            <Icon name={elllIcons16.cross} className="el-h-4 el-w-4" />
          </button>
        )
      }
    />
  );
}
