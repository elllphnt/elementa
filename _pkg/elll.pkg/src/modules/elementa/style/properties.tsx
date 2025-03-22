import { StylePropertyName } from "@elllphnt/elll-element";
import {
  ControlEntryVariant,
  elllIcons16,
  fractionUnits,
  Icon,
  lengthUnits,
  percentUnits,
  ResolvedControlProps,
} from "@repo/components";
import { Style } from "@repo/elementa-models";
import { combineLatestOrEmpty } from "@repo/utils";
import { combineLatest, map, Observable, of, switchMap } from "rxjs";
import { fontVariantName } from "~/src/libs/fonts/font";
import { resolveCommon } from "~/src/libs/utils";
import { IElll } from "~/src/types/elll";
import {
  EditorControlMap,
  ElllControlType,
  elllControlTypes,
} from "../../../components/ui/controls/_types";
import {
  getElllWorkspaceElementaProject,
  getElllWorkspaceElementaProject$,
} from "../project/_lib";

const icons = elllIcons16;

export type StylePropertyConfig<T extends ElllControlType = ElllControlType> = {
  name: StylePropertyName;
  control: T;
  initialValue?: any;
  autoInitialize?: boolean;
  controlSettings?: ResolvedControlProps<EditorControlMap, T>["settings"];
  displayName?: string;
  icon?: string;
  groups?: StylePropertyGroupConfig[];
  variant?: ControlEntryVariant;
  overrides?: (styles: Style[], elll: IElll) => Partial<StylePropertyConfig<T>>;
  overrides$?: (
    styles: Style[],
    elll: IElll,
  ) => Observable<Partial<StylePropertyConfig<T>>>;
};
export type StylePropertyGroupConfig = {
  name: string;
  icon: string;
  compound?: {
    key: string;
    label: string;
    icon: string;
    control: ElllControlType;
    controlSettings?: ResolvedControlProps<
      EditorControlMap,
      ElllControlType
    >["settings"];
  };
  enabled?: (value: any) => boolean;
  properties?: StylePropertyConfig[];
};

export const positionStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Position",
    icon: icons.position,
    properties: [
      {
        name: "position",
        displayName: "Position",
        icon: icons.position,
        control: elllControlTypes.Select,
        initialValue: "relative",
        controlSettings: {
          options: [
            { value: "relative", label: "Relative" },
            { value: "absolute", label: "Absolute" },
            { value: "fixed", label: "Fixed" },
            { value: "sticky", label: "Sticky" },
          ],
        },
        groups: [
          {
            name: "Inset",
            icon: icons.edges,
            compound: {
              key: "compound-inset",
              icon: icons.edges,
              label: "Edges",
              control: elllControlTypes.Dimension,
              controlSettings: {
                defaultUnit: "px",
                units: [...lengthUnits, ...percentUnits],
              },
            },
            properties: [
              {
                name: "top",
                displayName: "Top",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.top,
                control: elllControlTypes.Dimension,
                controlSettings: {
                  defaultUnit: "px",
                  units: [...lengthUnits, ...percentUnits],
                },
              },
              {
                name: "right",
                displayName: "Right",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.right,
                control: elllControlTypes.Dimension,
                controlSettings: {
                  defaultUnit: "px",
                  units: [...lengthUnits, ...percentUnits],
                },
              },
              {
                name: "bottom",
                displayName: "Bottom",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.bottom,
                control: elllControlTypes.Dimension,
                controlSettings: {
                  defaultUnit: "px",
                  units: [...lengthUnits, ...percentUnits],
                },
              },
              {
                name: "left",
                displayName: "Left",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.left,
                control: elllControlTypes.Dimension,
                controlSettings: {
                  defaultUnit: "px",
                  units: [...lengthUnits, ...percentUnits],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Z-Index",
    icon: icons.zIndex,
    properties: [
      {
        name: "z-index",
        displayName: "Z-Index",
        icon: icons.zIndex,
        initialValue: 1,
        control: elllControlTypes.Spinner,
        controlSettings: { showIncrementors: true },
      },
    ],
  },
];
export const boxStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Height",
    icon: icons.height,
    properties: [
      {
        name: "height",
        displayName: "Height",
        icon: icons.height,
        control: elllControlTypes.Dimension,
        controlSettings: {
          min: 0,
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits, ...fractionUnits],
        },
      },
      {
        name: "min-height",
        displayName: "Min Height",
        icon: icons.minHeight,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "max-height",
        displayName: "Max Height",
        icon: icons.maxHeight,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
  {
    name: "Width",
    icon: icons.width,
    properties: [
      {
        name: "width",
        displayName: "Width",
        icon: icons.width,
        control: elllControlTypes.Dimension,
        controlSettings: {
          min: 0,
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits, ...fractionUnits],
        },
      },
      {
        name: "min-width",
        displayName: "Min Width",
        icon: icons.minWidth,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "max-width",
        displayName: "Max Width",
        icon: icons.maxWidth,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
  {
    name: "Aspect Ratio",
    icon: icons.aspectRatio,
    properties: [
      {
        name: "aspect-ratio",
        displayName: "Aspect Ratio",
        icon: icons.aspectRatio,
        initialValue: 1,
        control: elllControlTypes.Spinner,
        controlSettings: {
          min: 0,
          step: 0.01,
          round: 2,
        },
      },
    ],
  },
  {
    name: "Corners",
    icon: icons.corner,
    compound: {
      key: "compound-corners",
      icon: icons.allCorner,
      label: "Corners",
      control: elllControlTypes.Length,
      controlSettings: {
        min: 0,
      },
    },
    properties: [
      {
        name: "border-top-left-radius",
        displayName: "Top Left",
        icon: icons.cornerTopLeft,
        control: elllControlTypes.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-top-right-radius",
        displayName: "Top Right",
        icon: icons.cornerTopRight,
        control: elllControlTypes.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-bottom-left-radius",
        displayName: "Bottom Left",
        icon: icons.cornerBottomLeft,
        control: elllControlTypes.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-bottom-right-radius",
        displayName: "Bottom Right",
        icon: icons.cornerBottomRight,
        control: elllControlTypes.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
];
export const layoutStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Layout",
    icon: icons.grid,
    properties: [
      {
        name: "display",
        displayName: "Layout",
        icon: icons.grid,
        control: elllControlTypes.Switch,
        initialValue: "flex",
        controlSettings: {
          options: [
            { value: "flex", label: <Icon name={icons.column} /> },
            { value: "grid", label: <Icon name={icons.grid} /> },
          ],
        },
        groups: [
          // Direction
          {
            name: "Direction",
            icon: icons.direction,
            enabled: (value) => value === "flex",
            properties: [
              {
                name: "flex-direction",
                displayName: "Direction",
                icon: icons.direction,
                control: elllControlTypes.Switch,
                initialValue: "row",
                autoInitialize: true,
                controlSettings: {
                  options: [
                    { value: "row", label: <Icon name={icons.direction} /> },
                    {
                      value: "column",
                      label: (
                        <Icon name={icons.direction} className="el-rotate-90" />
                      ),
                    },
                  ],
                },
              },
            ],
          },
          // Align
          {
            name: "Align",
            icon: icons.align,
            enabled: (value) => value === "flex",
            properties: [
              {
                name: "align-items",
                displayName: "Align",
                icon: icons.align,
                initialValue: "center",
                control: elllControlTypes.Select,
                controlSettings: {
                  options: [
                    { value: "stretch", label: "Stretch" },
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                    { value: "center", label: "Center" },
                    { value: "baseline", label: "Baseline" },
                  ],
                },
              },
            ],
          },
          // Justify
          {
            name: "Justify",
            icon: icons.justify,
            enabled: (value) => value === "flex",
            properties: [
              {
                name: "justify-content",
                displayName: "Justify",
                icon: icons.justify,
                initialValue: "center",
                control: elllControlTypes.Select,
                controlSettings: {
                  options: [
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                    { value: "center", label: "Center" },
                    { value: "space-between", label: "Space Between" },
                    { value: "space-around", label: "Space Around" },
                    { value: "space-evenly", label: "Space Evenly" },
                  ],
                },
              },
            ],
          },
          // Wrap
          {
            name: "Wrap",
            icon: icons.wrap,
            enabled: (value) => value === "flex",
            properties: [
              {
                name: "flex-wrap",
                displayName: "Wrap",
                icon: icons.wrap,
                control: elllControlTypes.Select,
                initialValue: "wrap",
                controlSettings: {
                  options: [
                    { value: "wrap", label: "Wrap" },
                    { value: "wrap-reverse", label: "Wrap Reverse" },
                  ],
                },
                groups: [
                  {
                    name: "Align Content",
                    icon: icons.alignContent,
                    properties: [
                      {
                        name: "align-content",
                        displayName: "Align Content",
                        icon: icons.alignContent,
                        control: elllControlTypes.Select,
                        initialValue: "center",
                        controlSettings: {
                          options: [
                            { value: "start", label: "Start" },
                            { value: "end", label: "End" },
                            { value: "center", label: "Center" },
                            { value: "stretch", label: "Stretch" },
                            { value: "space-between", label: "Space Between" },
                            { value: "space-around", label: "Space Around" },
                            { value: "space-evenly", label: "Space Evenly" },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // Grid
          {
            name: "Template",
            icon: icons.columns,
            enabled: (value) => value === "grid",
            properties: [
              {
                name: "grid-template-rows",
                displayName: "Rows",
                icon: icons.rows,
                initialValue: 2,
                control: elllControlTypes.Spinner,
                controlSettings: {
                  min: 0,
                  showIncrementors: true,
                },
              },
              {
                name: "grid-template-columns",
                displayName: "Columns",
                icon: icons.columns,
                initialValue: 2,
                control: elllControlTypes.Spinner,
                controlSettings: {
                  min: 0,
                  showIncrementors: true,
                },
              },
            ],
          },
          {
            name: "Items",
            icon: icons.container,
            enabled: (value) => value === "grid",
            properties: [
              {
                name: "justify-items",
                displayName: "Justify Items",
                icon: icons.justify,
                control: elllControlTypes.Select,
                controlSettings: {
                  options: [
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                    { value: "center", label: "Center" },
                    { value: "stretch", label: "Stretch" },
                  ],
                },
              },
              {
                name: "align-items",
                displayName: "Align Items",
                icon: icons.align,
                control: elllControlTypes.Select,
                controlSettings: {
                  options: [
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                    { value: "center", label: "Center" },
                    { value: "stretch", label: "Stretch" },
                  ],
                },
              },
            ],
          },
          {
            name: "Content",
            icon: icons.grid,
            enabled: (value) => value === "grid",
            properties: [
              {
                name: "justify-content",
                displayName: "Justify Content",
                icon: icons.justify,
                control: elllControlTypes.Select,
                controlSettings: {
                  options: [
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                    { value: "center", label: "Center" },
                    { value: "stretch", label: "Stretch" },
                    { value: "space-between", label: "Space Between" },
                    { value: "space-around", label: "Space Around" },
                    { value: "space-evenly", label: "Space Evenly" },
                  ],
                },
              },
              {
                name: "align-content",
                displayName: "Align Content",
                icon: icons.alignContent,
                control: elllControlTypes.Select,
                controlSettings: {
                  options: [
                    { value: "start", label: "Start" },
                    { value: "end", label: "End" },
                    { value: "center", label: "Center" },
                    { value: "stretch", label: "Stretch" },
                    { value: "space-between", label: "Space Between" },
                    { value: "space-around", label: "Space Around" },
                    { value: "space-evenly", label: "Space Evenly" },
                  ],
                },
              },
            ],
          },
          // Gap
          {
            name: "Gap",
            icon: icons.gap,
            compound: {
              key: "compound-gap",
              icon: icons.gap,
              label: "Gap",
              control: elllControlTypes.Length,
              controlSettings: {},
            },
            properties: [
              {
                name: "gap-y",
                displayName: "Row Gap",
                icon: icons.gap,
                initialValue: {
                  value: 8,
                  unit: "px",
                },
                control: elllControlTypes.Length,
                variant: ControlEntryVariant.Mini,
              },
              {
                name: "gap-x",
                displayName: "Column Gap",
                icon: icons.gap,
                initialValue: {
                  value: 8,
                  unit: "px",
                },
                control: elllControlTypes.Length,
                variant: ControlEntryVariant.Mini,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Padding",
    icon: icons.inset,
    compound: {
      key: "compound-padding",
      icon: icons.inset,
      label: "Padding",
      control: elllControlTypes.Dimension,
      controlSettings: {
        min: 0,
        defaultUnit: "px",
        units: [...lengthUnits, ...percentUnits],
      },
    },
    properties: [
      {
        name: "padding-top",
        displayName: "Padding Top",
        icon: icons.top,
        control: elllControlTypes.Dimension,
        controlSettings: {
          min: 0,
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits],
        },
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-right",
        displayName: "Padding Right",
        icon: icons.right,
        control: elllControlTypes.Dimension,
        controlSettings: {
          min: 0,
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits],
        },
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-bottom",
        displayName: "Padding Bottom",
        icon: icons.bottom,
        control: elllControlTypes.Dimension,
        controlSettings: {
          min: 0,
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits],
        },
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-left",
        displayName: "Padding Left",
        icon: icons.left,
        control: elllControlTypes.Dimension,
        controlSettings: {
          min: 0,
          defaultUnit: "px",
          units: [...lengthUnits, ...percentUnits],
        },
        variant: ControlEntryVariant.Mini,
      },
    ],
  },
  {
    name: "Overflow",
    icon: icons.overflow,
    properties: [
      {
        name: "overflow",
        displayName: "Overflow",
        icon: icons.overflow,
        control: elllControlTypes.Select,
        initialValue: "visible",
        controlSettings: {
          options: [
            { value: "visible", label: "Visible" },
            { value: "hidden", label: "Hidden" },
            { value: "scroll-y", label: "Scroll Vertical" },
            { value: "scroll-x", label: "Scroll Horizontal" },
            { value: "scroll-area", label: "Scroll Area" },
          ],
        },
      },
    ],
  },
];
export const textStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Color",
    icon: icons.color,
    properties: [
      {
        name: "color",
        displayName: "Color",
        icon: icons.color,
        control: elllControlTypes.Color,
      },
    ],
  },
  {
    name: "Font",
    icon: icons.font,
    properties: [
      {
        name: "font-family",
        displayName: "Font Family",
        icon: icons.font,
        control: elllControlTypes.Select,
        overrides: (styles, elll) => {
          // return fonts from elll
          const typefaces =
            getElllWorkspaceElementaProject(elll)?.styleManager.typefaceSheet
              .typefaces;
          return {
            controlSettings: {
              options: typefaces?.map((typeface) => ({
                value: typeface.definition?.family,
                label: typeface.definition?.family,
              })),
            },
          };
        },
        overrides$: (styles, elll) => {
          return getElllWorkspaceElementaProject$(elll).pipe(
            switchMap(
              (project) =>
                project?.styleManager.typefaceSheet.typefaces$ ?? of([]),
            ),
            map((typefaces) => ({
              controlSettings: {
                options: typefaces.map((typeface) => ({
                  value: typeface.definition?.family,
                  label: typeface.definition?.family,
                })),
              },
            })),
          );
        },
      },
      {
        name: "font-weight-style",
        displayName: "Weight Style",
        icon: icons.fontWeightStyle,
        control: elllControlTypes.Select,
        overrides: (styles, elll) => {
          const currentFontFamily = resolveCommon(
            styles.map((s) => s.propertyValue("font-family")),
          );
          const typeface =
            typeof currentFontFamily === "string"
              ? getElllWorkspaceElementaProject(
                  elll,
                )?.styleManager.typefaceSheet.typefaces.find(
                  (t) => t.definition?.family === currentFontFamily,
                )
              : undefined;

          const optionsFromTypeface = typeface?.variants?.map((variant) => ({
            value: variant,
            label: fontVariantName(variant),
          }));

          return {
            controlSettings: {
              options: optionsFromTypeface ?? [],
            },
          };
        },
        overrides$: (styles, elll) => {
          return combineLatest([
            getElllWorkspaceElementaProject$(elll).pipe(
              switchMap(
                (project) =>
                  project?.styleManager.typefaceSheet.typefaces$ ?? of([]),
              ),
            ),
            combineLatestOrEmpty(
              styles.map((s) => s.propertyValue$("font-family")),
            ),
          ]).pipe(
            map(([typefaces, fontFamilies]) => {
              const currentFontFamily = resolveCommon(fontFamilies);
              const typeface =
                typeof currentFontFamily === "string"
                  ? typefaces.find(
                      (t) => t.definition?.family === currentFontFamily,
                    )
                  : undefined;
              const optionsFromTypeface = typeface?.variants?.map(
                (variant) => ({
                  value: variant,
                  label: fontVariantName(variant),
                }),
              );
              return {
                controlSettings: {
                  options: optionsFromTypeface ?? [],
                },
              };
            }),
          );
        },
      },
    ],
  },
  {
    name: "Size",
    icon: icons.fontSize,
    properties: [
      {
        name: "font-size",
        displayName: "Size",
        icon: icons.fontSize,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "line-height",
        displayName: "Height",
        icon: icons.lineHeight,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
  {
    name: "Align",
    icon: icons.textAlignCenter,
    properties: [
      {
        name: "text-align",
        displayName: "Align",
        icon: icons.textAlignCenter,
        control: elllControlTypes.Switch,
        controlSettings: {
          options: [
            {
              value: "left",
              label: <Icon name={elllIcons16.textAlignStart} />,
            },
            {
              value: "center",
              label: <Icon name={elllIcons16.textAlignCenter} />,
            },
            { value: "right", label: <Icon name={elllIcons16.textAlignEnd} /> },
            {
              value: "justify",
              label: <Icon name={elllIcons16.textJustify} />,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Decoration",
    icon: icons.textDecoration,
    properties: [
      {
        name: "text-decoration",
        displayName: "Decoration",
        icon: icons.textDecoration,
        control: elllControlTypes.Switch,
        controlSettings: {
          options: [
            {
              value: "underline",
              label: <Icon name={elllIcons16.textDecorationUnderline} />,
            },
            {
              value: "overline",
              label: <Icon name={elllIcons16.textDecorationOverline} />,
            },
            {
              value: "line-through",
              label: <Icon name={elllIcons16.textDecorationStrikeout} />,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Transform",
    icon: icons.textCapitalize,
    properties: [
      {
        name: "text-transform",
        displayName: "Transform",
        icon: icons.textCapitalize,
        control: elllControlTypes.Switch,
        controlSettings: {
          options: [
            {
              value: "uppercase",
              label: <Icon name={elllIcons16.textUppercase} />,
            },
            {
              value: "lowercase",
              label: <Icon name={elllIcons16.textLowercase} />,
            },
            {
              value: "capitalize",
              label: <Icon name={elllIcons16.textCapitalize} />,
            },
          ],
        },
      },
    ],
  },
  {
    name: "Overflow",
    icon: icons.textOverflow,
    properties: [
      {
        name: "text-overflow",
        displayName: "Overflow",
        icon: icons.textOverflow,
        control: elllControlTypes.Select,
        controlSettings: {
          options: [
            { value: "clip", label: "Clip" },
            { value: "ellipsis", label: "Ellipsis" },
          ],
        },
      },
    ],
  },
  {
    name: "Spacing",
    icon: icons.letterSpace,
    properties: [
      {
        name: "letter-spacing",
        displayName: "Spacing",
        icon: icons.letterSpace,
        control: elllControlTypes.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
];
export const appearancesStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Border",
    icon: icons.border,
  },
  {
    name: "Opacity",
    icon: icons.opacity,
    properties: [
      {
        name: "opacity",
        displayName: "Opacity",
        icon: icons.opacity,
        control: elllControlTypes.Spinner,
        controlSettings: {
          min: 0,
          max: 1,
          step: 0.01,
          round: 2,
        },
      },
    ],
  },
  {
    name: "Visibility",
    icon: icons.visibility,
    properties: [
      {
        name: "visibility",
        displayName: "Visibility",
        icon: icons.visibility,
        control: elllControlTypes.Select,
        controlSettings: {
          options: [
            { value: "visible", label: "Visible" },
            { value: "hidden", label: "Hidden" },
          ],
        },
      },
    ],
  },
  {
    name: "Cursor",
    icon: icons.toolSelect,
    properties: [
      {
        name: "cursor",
        displayName: "Cursor",
        icon: icons.toolSelect,
        control: elllControlTypes.Select,
        controlSettings: {
          options: [
            { value: "default", label: "Default" },
            { value: "pointer", label: "Pointer" },
            { value: "text", label: "Text" },
            { value: "move", label: "Move" },
            { value: "not-allowed", label: "Not Allowed" },
          ],
        },
      },
    ],
  },
];
export const transformStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Translate",
    icon: icons.transform,
    properties: [
      {
        name: "translate-x",
        displayName: "Translate X",
        icon: icons.translateX,
        control: elllControlTypes.Length,
      },
      {
        name: "translate-y",
        displayName: "Translate Y",
        icon: icons.translateY,
        control: elllControlTypes.Length,
      },
    ],
  },
  {
    name: "Rotate",
    icon: icons.rotate,
    properties: [
      {
        name: "rotate-z",
        displayName: "Rotate",
        icon: icons.rotateX,
        control: elllControlTypes.Angle,
      },
    ],
  },
  {
    name: "Scale",
    icon: icons.scale,
    compound: {
      key: "compound-scale",
      icon: icons.scale,
      label: "Scale",
      control: elllControlTypes.Spinner,
      controlSettings: {
        min: 0,
        step: 0.01,
        round: 2,
      },
    },
    properties: [
      {
        name: "scale-x",
        displayName: "Scale X",
        icon: icons.scaleX,
        control: elllControlTypes.Spinner,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
          step: 0.01,
          round: 2,
        },
      },
      {
        name: "scale-y",
        displayName: "Scale Y",
        icon: icons.scaleY,
        control: elllControlTypes.Spinner,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
          step: 0.01,
          round: 2,
        },
      },
    ],
  },
  {
    name: "Skew",
    icon: icons.skew,
    properties: [
      {
        name: "skew-x",
        displayName: "Skew X",
        icon: icons.skewX,
        control: elllControlTypes.Spinner,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "skew-y",
        displayName: "Skew Y",
        icon: icons.skewY,
        control: elllControlTypes.Spinner,
        variant: ControlEntryVariant.Mini,
      },
    ],
  },
];
export const transitionStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Properties",
    icon: icons.transition,
    properties: [
      {
        name: "transition-property",
        displayName: "Translate Property",
        icon: icons.transition,
        control: elllControlTypes.String,
      },
    ],
  },
  {
    name: "Duration",
    icon: icons.time,
    properties: [
      {
        name: "transition-duration",
        displayName: "Duration",
        icon: icons.time,
        control: elllControlTypes.Duration,
      },
    ],
  },
  {
    name: "Timing",
    icon: icons.timing,
    properties: [
      {
        name: "transition-timing-function",
        displayName: "Timing",
        icon: icons.timing,
        control: elllControlTypes.String,
      },
    ],
  },
  {
    name: "Delay",
    icon: icons.time,
    properties: [
      {
        name: "transition-delay",
        displayName: "Delay",
        icon: icons.time,
        control: elllControlTypes.Duration,
      },
    ],
  },
];
