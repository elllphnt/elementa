import { StylePropertyName } from "@elllphnt/elll-element";
import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  fractionUnits,
  Icon,
  lengthUnits,
  percentUnits,
  ResolvedControlProps,
} from "@repo/components";
import {
  EditorControlMap,
  EditorControlType,
  EditorOwnControlType,
} from "../control_map";

const icons = elllIcons16;

export type StylePropertyConfig<
  T extends EditorControlType = EditorControlType,
> = {
  name: StylePropertyName;
  control: T;
  initialValue?: any;
  autoInitialize?: boolean;
  controlSettings?: ResolvedControlProps<EditorControlMap, T>["settings"];
  displayName?: string;
  icon?: string;
  groups?: StylePropertyGroupConfig[];
  variant?: ControlEntryVariant;
};
export type StylePropertyGroupConfig = {
  name: string;
  icon: string;
  compound?: {
    key: string;
    label: string;
    icon: string;
    control: EditorControlType;
    controlSettings?: ResolvedControlProps<
      EditorControlMap,
      EditorControlType
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
        control: BaseControlType.Select,
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
              control: BaseControlType.Length,
              controlSettings: {
                min: 0,
              },
            },
            properties: [
              {
                name: "top",
                displayName: "Top",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.top,
                control: BaseControlType.Length,
                controlSettings: {
                  min: 0,
                },
              },
              {
                name: "right",
                displayName: "Right",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.right,
                control: BaseControlType.Length,
                controlSettings: {
                  min: 0,
                },
              },
              {
                name: "bottom",
                displayName: "Bottom",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.bottom,
                control: BaseControlType.Length,
                controlSettings: {
                  min: 0,
                },
              },
              {
                name: "left",
                displayName: "Left",
                autoInitialize: true,
                variant: ControlEntryVariant.Mini,
                icon: icons.left,
                control: BaseControlType.Length,
                controlSettings: {
                  min: 0,
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
        control: BaseControlType.Spinner,
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
        control: BaseControlType.Dimension,
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
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "max-height",
        displayName: "Max Height",
        icon: icons.maxHeight,
        control: BaseControlType.Length,
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
        control: BaseControlType.Dimension,
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
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "max-width",
        displayName: "Max Width",
        icon: icons.maxWidth,
        control: BaseControlType.Length,
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
        control: BaseControlType.Spinner,
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
      control: BaseControlType.Length,
      controlSettings: {
        min: 0,
      },
    },
    properties: [
      {
        name: "border-top-left-radius",
        displayName: "Top Left",
        icon: icons.cornerTopLeft,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-top-right-radius",
        displayName: "Top Right",
        icon: icons.cornerTopRight,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-bottom-left-radius",
        displayName: "Bottom Left",
        icon: icons.cornerBottomLeft,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-bottom-right-radius",
        displayName: "Bottom Right",
        icon: icons.cornerBottomRight,
        control: BaseControlType.Length,
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
        control: BaseControlType.Switch,
        initialValue: "flex",
        controlSettings: {
          options: [
            { value: "flex", label: <Icon name={icons.row} /> },
            { value: "grid", label: <Icon name={icons.grid} /> },
          ],
        },
        groups: [
          // Flex
          {
            name: "Flex",
            icon: icons.column,
            enabled: (value) => value === "flex",
            properties: [
              {
                name: "flex-direction",
                displayName: "Direction",
                icon: icons.direction,
                control: BaseControlType.Switch,
                initialValue: "row",
                autoInitialize: true,
                controlSettings: {
                  options: [
                    { value: "row", label: <Icon name={icons.row} /> },
                    { value: "column", label: <Icon name={icons.column} /> },
                  ],
                },
              },
              {
                name: "justify-content",
                displayName: "Justify",
                icon: icons.justifyContent,
                control: BaseControlType.Select,
                autoInitialize: true,
                initialValue: "center",
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
              {
                name: "align-items",
                displayName: "Align",
                icon: icons.alignItems,
                control: BaseControlType.Select,
                initialValue: "center",
                autoInitialize: true,
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
          // Grid
          {
            name: "Grid",
            icon: icons.grid,
            enabled: (value) => value === "grid",
            properties: [
              {
                name: "grid-template-rows",
                displayName: "Rows",
                icon: icons.row,
                control: BaseControlType.Spinner,
                controlSettings: {
                  min: 0,
                  showIncrementors: true,
                },
              },
              {
                name: "grid-template-columns",
                displayName: "Columns",
                icon: icons.column,
                initialValue: 2,
                autoInitialize: true,
                control: BaseControlType.Spinner,
                controlSettings: {
                  min: 0,
                  showIncrementors: true,
                },
              },
              {
                name: "justify-items",
                displayName: "Justify Items",
                icon: icons.justify,
                control: BaseControlType.Select,
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
                icon: icons.alignItems,
                control: BaseControlType.Select,
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
                name: "justify-content",
                displayName: "Justify Content",
                icon: icons.justifyContent,
                control: BaseControlType.Select,
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
                control: BaseControlType.Select,
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
              control: BaseControlType.Length,
              controlSettings: {
                min: 0,
              },
            },
            properties: [
              {
                name: "gap-y",
                displayName: "Row Gap",
                icon: icons.gap,
                initialValue: { value: 8, unit: "px" },
                autoInitialize: true,
                control: BaseControlType.Length,
                variant: ControlEntryVariant.Mini,
              },
              {
                name: "gap-x",
                displayName: "Column Gap",
                icon: icons.gap,
                initialValue: { value: 8, unit: "px" },
                autoInitialize: true,
                control: BaseControlType.Length,
                variant: ControlEntryVariant.Mini,
              },
            ],
          },
          // Wrap
          {
            name: "Wrap",
            icon: icons.wrap,
            properties: [
              {
                name: "flex-wrap",
                displayName: "Wrap",
                icon: icons.wrap,
                control: BaseControlType.Select,
                initialValue: "wrap",
                controlSettings: {
                  options: [
                    { value: "wrap", label: "Wrap" },
                    { value: "wrap-reverse", label: "Wrap Reverse" },
                  ],
                },
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
      icon: icons.edges,
      label: "Padding",
      control: BaseControlType.Length,
    },
    properties: [
      {
        name: "padding-top",
        displayName: "Padding Top",
        icon: icons.top,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-right",
        displayName: "Padding Right",
        icon: icons.right,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-bottom",
        displayName: "Padding Bottom",
        icon: icons.bottom,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-left",
        displayName: "Padding Left",
        icon: icons.left,
        control: BaseControlType.Length,
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
        control: BaseControlType.Select,
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
    name: "Font",
    icon: icons.font,
    properties: [
      {
        name: "font-family",
        displayName: "Font Family",
        icon: icons.fontFamily,
        control: BaseControlType.Text,
      },
      {
        name: "font-weight-style",
        displayName: "Weight Style",
        icon: icons.fontWeightStyle,
        control: BaseControlType.Select,
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
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "line-height",
        displayName: "Height",
        icon: icons.lineHeight,
        control: BaseControlType.Length,
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
        control: BaseControlType.Select,
        controlSettings: {
          options: [
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
            { value: "justify", label: "Justify" },
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
        control: BaseControlType.Select,
        controlSettings: {
          options: [
            { value: "none", label: "None" },
            { value: "underline", label: "Underline" },
            { value: "overline", label: "Overline" },
            { value: "line-through", label: "Line Through" },
          ],
        },
      },
    ],
  },
  {
    name: "Transform",
    icon: icons.textTransform,
    properties: [
      {
        name: "text-transform",
        displayName: "Transform",
        icon: icons.textTransform,
        control: BaseControlType.Select,
        controlSettings: {
          options: [
            { value: "none", label: "None" },
            { value: "uppercase", label: "Uppercase" },
            { value: "lowercase", label: "Lowercase" },
            { value: "capitalize", label: "Capitalize" },
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
        control: BaseControlType.Select,
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
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
];
export const appearancesStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Foreground",
    icon: icons.fileVector,
    properties: [
      {
        name: "color",
        displayName: "Color",
        icon: icons.fileVector,
        control: BaseControlType.Color,
      },
    ],
  },
  {
    name: "Background",
    icon: icons.background,
    properties: [
      {
        name: "background",
        displayName: "Background",
        icon: icons.containerFilled,
        control: EditorOwnControlType.Fill,
      },
    ],
  },
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
        control: BaseControlType.Spinner,
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
        control: BaseControlType.Select,
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
        control: BaseControlType.Select,
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
        control: BaseControlType.Length,
      },
      {
        name: "translate-y",
        displayName: "Translate Y",
        icon: icons.translateY,
        control: BaseControlType.Length,
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
        control: BaseControlType.Angle,
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
      control: BaseControlType.Spinner,
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
        control: BaseControlType.Spinner,
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
        control: BaseControlType.Spinner,
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
        control: BaseControlType.Spinner,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "skew-y",
        displayName: "Skew Y",
        icon: icons.skewY,
        control: BaseControlType.Spinner,
        variant: ControlEntryVariant.Mini,
      },
    ],
  },
];
