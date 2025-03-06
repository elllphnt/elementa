import {
  BaseControlType,
  ControlEntryVariant,
  elllIcons16,
  ResolvedControlProps,
} from "@repo/components";
import { StylePropertyName } from "@repo/elementa";
import {
  EditorControlMap,
  EditorControlType,
  EditorOwnControlType,
} from "../control_map";

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
    icon: elllIcons16.position,
    properties: [
      {
        name: "position",
        displayName: "Position",
        icon: elllIcons16.position,
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
            icon: elllIcons16.edges,
            compound: {
              key: "compound-inset",
              icon: elllIcons16.edges,
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
                icon: elllIcons16.top,
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
                icon: elllIcons16.right,
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
                icon: elllIcons16.bottom,
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
                icon: elllIcons16.left,
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
    icon: elllIcons16.zIndex,
    properties: [
      {
        name: "z-index",
        displayName: "Z-Index",
        icon: elllIcons16.zIndex,
        initialValue: 1,
        control: BaseControlType.Spinner,
      },
    ],
  },
];
export const boxStylePropertyControls: StylePropertyGroupConfig[] = [
  {
    name: "Height",
    icon: elllIcons16.size,
    properties: [
      {
        name: "height",
        displayName: "Height",
        icon: elllIcons16.size,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "min-height",
        displayName: "Min Height",
        icon: elllIcons16.minSize,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "max-height",
        displayName: "Max Height",
        icon: elllIcons16.maxSize,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
  {
    name: "Width",
    icon: elllIcons16.maxSize,
    properties: [
      {
        name: "width",
        displayName: "Width",
        icon: elllIcons16.size,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "min-width",
        displayName: "Min Width",
        icon: elllIcons16.minSize,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "max-width",
        displayName: "Max Width",
        icon: elllIcons16.maxSize,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
  {
    name: "Aspect Ratio",
    icon: elllIcons16.aspectRatio,
    properties: [
      {
        name: "aspect-ratio",
        displayName: "Aspect Ratio",
        icon: elllIcons16.aspectRatio,
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
    icon: elllIcons16.corner,
    compound: {
      key: "compound-corners",
      icon: elllIcons16.corner,
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
        icon: elllIcons16.corner,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-top-right-radius",
        displayName: "Top Right",
        icon: elllIcons16.corner,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-bottom-right-radius",
        displayName: "Bottom Right",
        icon: elllIcons16.corner,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "border-bottom-left-radius",
        displayName: "Bottom Left",
        icon: elllIcons16.corner,
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
    icon: elllIcons16.grid,
    properties: [
      {
        name: "display",
        displayName: "Layout",
        icon: elllIcons16.display,
        control: BaseControlType.Select,
        initialValue: "flex",
        controlSettings: {
          options: [
            { value: "flex", label: "Stack" },
            { value: "grid", label: "Grid" },
          ],
        },
        groups: [
          // Flex
          {
            name: "Flex",
            icon: elllIcons16.column,
            enabled: (value) => value === "flex",
            properties: [
              {
                name: "flex-direction",
                displayName: "Direction",
                icon: elllIcons16.direction,
                control: BaseControlType.Select,
                initialValue: "row",
                autoInitialize: true,
                controlSettings: {
                  options: [
                    { value: "row", label: "Row" },
                    { value: "row-reverse", label: "Row Reverse" },
                    { value: "column", label: "Column" },
                    { value: "column-reverse", label: "Column Reverse" },
                  ],
                },
              },
              {
                name: "justify-content",
                displayName: "Justify",
                icon: elllIcons16.justifyContent,
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
                icon: elllIcons16.alignItems,
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
            icon: elllIcons16.grid,
            enabled: (value) => value === "grid",
            properties: [
              {
                name: "grid-template-rows",
                displayName: "Rows",
                icon: elllIcons16.row,
                control: BaseControlType.Spinner,
              },
              {
                name: "grid-template-columns",
                displayName: "Columns",
                icon: elllIcons16.column,
                initialValue: 2,
                autoInitialize: true,
                control: BaseControlType.Spinner,
              },
              {
                name: "justify-items",
                displayName: "Justify Items",
                icon: elllIcons16.justify,
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
                icon: elllIcons16.alignItems,
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
                icon: elllIcons16.justifyContent,
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
                icon: elllIcons16.alignContent,
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
            icon: elllIcons16.gap,
            compound: {
              key: "compound-gap",
              icon: elllIcons16.gap,
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
                icon: elllIcons16.gap,
                initialValue: { value: 8, unit: "px" },
                autoInitialize: true,
                control: BaseControlType.Length,
                variant: ControlEntryVariant.Mini,
              },
              {
                name: "gap-x",
                displayName: "Column Gap",
                icon: elllIcons16.gap,
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
            icon: elllIcons16.wrap,
            properties: [
              {
                name: "flex-wrap",
                displayName: "Wrap",
                icon: elllIcons16.wrap,
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
    icon: elllIcons16.inset,
    compound: {
      key: "compound-padding",
      icon: elllIcons16.edges,
      label: "Padding",
      control: BaseControlType.Length,
    },
    properties: [
      {
        name: "padding-top",
        displayName: "Padding Top",
        icon: elllIcons16.top,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-right",
        displayName: "Padding Right",
        icon: elllIcons16.right,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-bottom",
        displayName: "Padding Bottom",
        icon: elllIcons16.bottom,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "padding-left",
        displayName: "Padding Left",
        icon: elllIcons16.left,
        control: BaseControlType.Length,
        variant: ControlEntryVariant.Mini,
      },
    ],
  },
  {
    name: "Overflow",
    icon: elllIcons16.overflow,
    properties: [
      {
        name: "overflow",
        displayName: "Overflow",
        icon: elllIcons16.overflow,
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
    icon: elllIcons16.font,
    properties: [
      {
        name: "font-family",
        displayName: "Font Family",
        icon: elllIcons16.fontFamily,
        control: BaseControlType.Text,
      },
      {
        name: "font-weight-style",
        displayName: "Weight Style",
        icon: elllIcons16.fontWeightStyle,
        control: BaseControlType.Select,
      },
    ],
  },
  {
    name: "Size",
    icon: elllIcons16.fontSize,
    properties: [
      {
        name: "font-size",
        displayName: "Size",
        icon: elllIcons16.fontSize,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "line-height",
        displayName: "Height",
        icon: elllIcons16.lineHeight,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
    ],
  },
  {
    name: "Align",
    icon: elllIcons16.textAlignCenter,
    properties: [
      {
        name: "text-align",
        displayName: "Align",
        icon: elllIcons16.textAlignCenter,
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
    icon: elllIcons16.textDecoration,
    properties: [
      {
        name: "text-decoration",
        displayName: "Decoration",
        icon: elllIcons16.textDecoration,
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
    icon: elllIcons16.textTransform,
    properties: [
      {
        name: "text-transform",
        displayName: "Transform",
        icon: elllIcons16.textTransform,
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
    icon: elllIcons16.textOverflow,
    properties: [
      {
        name: "text-overflow",
        displayName: "Overflow",
        icon: elllIcons16.textOverflow,
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
    icon: elllIcons16.letterSpace,
    properties: [
      {
        name: "letter-spacing",
        displayName: "Spacing",
        icon: elllIcons16.letterSpace,
        control: BaseControlType.Length,
        controlSettings: {
          min: 0,
        },
      },
      {
        name: "word-spacing",
        displayName: "Word Spacing",
        icon: elllIcons16.wordSpace,
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
    icon: elllIcons16.fileVector,
    properties: [
      {
        name: "color",
        displayName: "Color",
        icon: elllIcons16.fileVector,
        control: BaseControlType.Color,
      },
    ],
  },
  {
    name: "Background",
    icon: elllIcons16.background,
    properties: [
      {
        name: "background",
        displayName: "Background",
        icon: elllIcons16.containerFilled,
        control: EditorOwnControlType.Fill,
      },
    ],
  },
  {
    name: "Border",
    icon: elllIcons16.border,
    properties: [
      {
        name: "border",
        displayName: "Border",
        icon: elllIcons16.border,
        control: BaseControlType.Border,
      },
    ],
  },
  {
    name: "Opacity",
    icon: elllIcons16.opacity,
    properties: [
      {
        name: "opacity",
        displayName: "Opacity",
        icon: elllIcons16.opacity,
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
    icon: elllIcons16.visibility,
    properties: [
      {
        name: "visibility",
        displayName: "Visibility",
        icon: elllIcons16.visibility,
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
    icon: elllIcons16.toolSelect,
    properties: [
      {
        name: "cursor",
        displayName: "Cursor",
        icon: elllIcons16.toolSelect,
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
    icon: elllIcons16.transform,
    properties: [
      {
        name: "translate-x",
        displayName: "Translate X",
        icon: elllIcons16.translateX,
        control: BaseControlType.Length,
      },
      {
        name: "translate-y",
        displayName: "Translate Y",
        icon: elllIcons16.translateY,
        control: BaseControlType.Length,
      },
    ],
  },
  {
    name: "Rotate",
    icon: elllIcons16.rotate,
    properties: [
      {
        name: "rotate-z",
        displayName: "Rotate",
        icon: elllIcons16.rotateX,
        control: BaseControlType.Angle,
      },
    ],
  },
  {
    name: "Scale",
    icon: elllIcons16.scale,
    compound: {
      key: "compound-scale",
      icon: elllIcons16.scale,
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
        icon: elllIcons16.scaleX,
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
        icon: elllIcons16.scaleY,
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
    icon: elllIcons16.skew,
    properties: [
      {
        name: "skew-x",
        displayName: "Skew X",
        icon: elllIcons16.skewX,
        control: BaseControlType.Spinner,
        variant: ControlEntryVariant.Mini,
      },
      {
        name: "skew-y",
        displayName: "Skew Y",
        icon: elllIcons16.skewY,
        control: BaseControlType.Spinner,
        variant: ControlEntryVariant.Mini,
      },
    ],
  },
];
