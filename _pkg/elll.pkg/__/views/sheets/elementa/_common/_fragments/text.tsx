import {
  BaseControlType,
  elllIcons16,
  Icon,
  resolveCommonValue,
  useAction,
} from "@repo/components";
import { Style, StyleData } from "@repo/elementa";
import { combineLatestOrEmpty, useObservable } from "@repo/utils";
import { map } from "rxjs";
import { EditorOwnControlType } from "../../../../../components/controls/control_map";
import { InstanceStyleControlEntry } from "../../../../../components/controls/infrastructure/style/instance_style";
import {
  useElementPropertyState,
  useStylesCommonPropertyValue,
} from "../../../../../hooks/elementa/style";
import { useProjectTypefaces } from "../../../../../hooks/project/project";
import { fontVariantName } from "../../../../../libs/typeface";

export function TextStyleControl({
  styles,
}: {
  styles: Style<StyleData>[];
}): JSX.Element {
  const activeFontFamily = useStylesCommonPropertyValue(styles, "font-family");
  const typefaces = useProjectTypefaces();
  const activeTypeface = typefaces.find(
    (typeface) => typeface.id === activeFontFamily,
  );
  const activeTypefaceVariants = useObservable(
    activeTypeface?.variants$,
    activeTypeface?.variants,
  );

  const [showColor, setShowColor] = useElementPropertyState(["text", "color"]);
  const [showFont, setShowFont] = useElementPropertyState(["text", "font"]);
  const [showSize, setShowSize] = useElementPropertyState(["text", "size"]);
  const [showLineHeight, setShowLineHeight] = useElementPropertyState([
    "text",
    "lineHeight",
  ]);
  const [showLetterSpacing, setShowLetterSpacing] = useElementPropertyState([
    "text",
    "letterSpacing",
  ]);
  const [showAlign, setShowAlign] = useElementPropertyState(["text", "align"]);
  const [showDecoration, setShowDecoration] = useElementPropertyState([
    "text",
    "decoration",
  ]);
  const [showOverflow, setShowOverflow] = useElementPropertyState([
    "text",
    "overflow",
  ]);
  const [showWhiteSpace, setShowWhiteSpace] = useElementPropertyState([
    "text",
    "whiteSpace",
  ]);
  const [showWordBreak, setShowWordBreak] = useElementPropertyState([
    "text",
    "wordBreak",
  ]);

  useAction(
    {
      index: 0,
      title: "Color",
      active: !!showColor,
      icon: elllIcons16.containerFilled,
      handler: () => {
        setShowColor(!showColor);
      },
    },
    [showColor, setShowColor],
  );
  useAction(
    {
      index: 1,
      title: "Font",
      active: !!showFont,
      icon: elllIcons16.font,
      handler: () => {
        setShowFont(!showFont);
      },
    },
    [showFont, setShowFont],
  );
  useAction(
    {
      index: 2,
      title: "Size",
      active: !!showSize,
      icon: elllIcons16.fontSize,
      handler: () => {
        setShowSize(!showSize);
      },
    },
    [showSize, setShowSize],
  );
  useAction(
    {
      index: 3,
      title: "Align",
      active: !!showAlign,
      icon: elllIcons16.textAlignCenter,
      handler: () => {
        setShowAlign(!showAlign);
      },
    },
    [showAlign, setShowAlign],
  );
  useAction(
    {
      index: 4,
      title: "Line Height",
      active: !!showLineHeight,
      icon: elllIcons16.lineHeight,
      handler: () => {
        setShowLineHeight(!showLineHeight);
      },
    },
    [showLineHeight, setShowLineHeight],
  );
  useAction(
    {
      index: 5,
      title: "Letter Spacing",
      active: !!showLetterSpacing,
      icon: elllIcons16.letterSpace,
      handler: () => {
        setShowLetterSpacing(!showLetterSpacing);
      },
    },
    [showLetterSpacing, setShowLetterSpacing],
  );
  useAction(
    {
      index: 6,
      title: "Decoration",
      active: !!showDecoration,
      icon: elllIcons16.textDecoration,
      handler: () => {
        setShowDecoration(!showDecoration);
      },
    },
    [showDecoration, setShowDecoration],
  );
  useAction(
    {
      index: 7,
      title: "Overflow",
      active: !!showOverflow,
      icon: elllIcons16.overflow,
      handler: () => {
        setShowOverflow(!showOverflow);
      },
    },
    [showOverflow, setShowOverflow],
  );
  useAction(
    {
      index: 8,
      title: "White Space",
      active: !!showWhiteSpace,
      icon: elllIcons16.wrap,
      handler: () => {
        setShowWhiteSpace(!showWhiteSpace);
      },
    },
    [showWhiteSpace, setShowWhiteSpace],
  );
  useAction(
    {
      index: 9,
      title: "Word Break",
      active: !!showWordBreak,
      icon: elllIcons16.text,
      handler: () => {
        setShowWordBreak(!showWordBreak);
      },
    },
    [showWordBreak, setShowWordBreak],
  );

  return (
    <>
      {showColor && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Color"
          property="color"
          control={BaseControlType.Color}
        />
      )}
      {showFont && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Font family"
          property="font-family"
          control={EditorOwnControlType.Typeface}
          controlSettings={{
            variantValue: resolveCommonValue(
              styles.map((style) => style.propertyValue("font-weight-style")),
            ),
            variantValue$: combineLatestOrEmpty(
              styles.map((style) => style.propertyValue$("font-weight-style")),
            ).pipe(map((values) => resolveCommonValue(values))),
            setVariantValue: (value) => {
              styles.forEach((style) => {
                style.setProperty("font-weight-style", value);
              });
            },
          }}
        />
      )}
      {showFont && activeTypeface ? (
        <InstanceStyleControlEntry
          styles={styles}
          name="Variant"
          property="font-weight-style"
          control={BaseControlType.Select}
          controlSettings={{
            options:
              activeTypefaceVariants?.map((variant) => ({
                label: fontVariantName(variant),
                value: variant,
              })) ?? [],
          }}
        />
      ) : null}
      {showSize && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Size"
          property="font-size"
          control={BaseControlType.Length}
        />
      )}
      {showAlign && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Align"
          property="text-align"
          control={BaseControlType.Switch}
          controlSettings={{
            options: [
              {
                label: <Icon name={elllIcons16.textAlignStart} />,
                value: "start",
              },
              {
                label: <Icon name={elllIcons16.textAlignCenter} />,
                value: "center",
              },
              {
                label: <Icon name={elllIcons16.textAlignEnd} />,
                value: "end",
              },
              {
                label: <Icon name={elllIcons16.textJustify} />,
                value: "justify",
              },
            ],
          }}
        />
      )}
      {showLineHeight && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Height"
          property="line-height"
          control={BaseControlType.Length}
        />
      )}
      {showLetterSpacing && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Spacing"
          property="letter-spacing"
          control={BaseControlType.Length}
        />
      )}
      {showDecoration && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Decoration"
          property="text-decoration"
          control={BaseControlType.Switch}
          controlSettings={{
            options: [
              {
                label: <Icon name={elllIcons16.textDecoration} />,
                value: "underline",
              },
              {
                label: <Icon name={elllIcons16.textDecoration} />,
                value: "line-through",
              },
              {
                label: <Icon name={elllIcons16.textDecoration} />,
                value: "overline",
              },
            ],
          }}
        />
      )}
      {showOverflow && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Overflow"
          property="text-overflow"
          control={BaseControlType.Select}
          controlSettings={{
            options: [
              {
                label: "Clip",
                value: "clip",
              },
              {
                label: "Ellipsis",
                value: "ellipsis",
              },
            ],
          }}
        />
      )}
      {showWhiteSpace && (
        <InstanceStyleControlEntry
          styles={styles}
          name="White Space"
          property="white-space"
          control={BaseControlType.Select}
          controlSettings={{
            options: [
              {
                label: "Normal",
                value: "normal",
              },
              {
                label: "Pre",
                value: "pre",
              },
              {
                label: "Pre-wrap",
                value: "pre-wrap",
              },
              {
                label: "Pre-line",
                value: "pre-line",
              },
              {
                label: "No Wrap",
                value: "nowrap",
              },
            ],
          }}
        />
      )}
      {showWordBreak && (
        <InstanceStyleControlEntry
          styles={styles}
          name="Word Break"
          property="word-break"
          control={BaseControlType.Select}
          controlSettings={{
            options: [
              {
                label: "Normal",
                value: "normal",
              },
              {
                label: "Break All",
                value: "break-all",
              },
              {
                label: "Keep All",
                value: "keep-all",
              },
            ],
          }}
        />
      )}
    </>
  );
}
