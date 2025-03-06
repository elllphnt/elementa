import {
  entityTypeMatch,
  entityTypes,
  FrameWidgetInstance,
  Handle,
  handleProperties,
  Instance,
} from "@repo/elementa";
import { combineLatestOrEmpty } from "@repo/utils";
import { map, of, switchMap } from "rxjs";
import { SheetView } from "../../../components/sheet/types";
import { RenderableAlignControlSheet } from "./_common/renderables/alignment";
import { ElementAnimationsControlSheet } from "./design/elements/animations/animations";
import { ElementAppearancesControlSheet } from "./design/elements/appearances/appearances";
import { elementAppearancesSheets } from "./design/elements/appearances/panel/_";
import { ArrayControlSheet } from "./design/elements/array/array";
import { PropsSheet } from "./design/elements/component/props";
import { CodeStylesheetSheet } from "./design/elements/component/stylesheets";
import { LayoutControlSheet } from "./design/elements/container/layout";
import { ContainerTextControlSheet } from "./design/elements/container/text";
import { MediaSheet } from "./design/elements/content/content";
import { ElementEffectsControlSheet } from "./design/elements/effects/effects";
import { ElementSizeControlSheet } from "./design/elements/element/box";
import { ElementPositionControlSheet } from "./design/elements/element/position";
import { ElementStyleControlSheet } from "./design/elements/element/style";
import { ElementStylesheetsControlSheet } from "./design/elements/stylesheets/stylesheets";
import { TextControlSheet } from "./design/elements/text/text";
import { ElementTransitionsControlSheet } from "./design/elements/transitions/transitions";
import { VectorControlSheet } from "./design/elements/vector/vector";
import { FrameComponentDataSheet } from "./design/frame/data";
import { FrameControl } from "./design/frame/frame";
import { FrameLayoutControlSheet } from "./design/frame/layout";
import { FrameComponentPropsSheet } from "./design/frame/props";
import { FrameStyleControlSheet } from "./design/frame/style";
import { FrameTextControlSheet } from "./design/frame/text";
import { FrameViewportSheet } from "./design/frame/viewport";
import { projectSheets } from "./project/_";

export const elementaSheetViews = {
  // renderable

  alignment: {
    id: "elementa.sheets.renderable.alignment",
    title: "Alignment",
    render: RenderableAlignControlSheet,
    enabled: ({ selection }) => {
      return (
        selection.length > 1 &&
        selection.every((handle) => handle.property(handleProperties.isMovable))
      );
    },
  },

  // frame

  frame: {
    id: "elementa.sheet.frame.frame",
    title: "Frame",
    render: FrameControl,
    enabled: ({ selection }) => {
      return selection.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameViewport: {
    id: "elementa.sheet.frame.viewport",
    title: "Viewport",
    render: FrameViewportSheet,
    enabled: ({ selection }) => {
      return selection.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameProps: {
    id: "elementa.sheets.frame.props",
    title: "Props",
    render: FrameComponentPropsSheet,
    enabled: ({ instances }) => {
      return instances.every(
        (instance) =>
          entityTypeMatch(instance.entity.type, entityTypes.widgets.frame) &&
          !(instance as FrameWidgetInstance).entity.fragmentId &&
          (instance as FrameWidgetInstance).fragment?.entity.component.props
            .length,
      );
    },
    enabled$: ({ instances }) => {
      return combineLatestOrEmpty(
        instances.map((instance) => {
          if (
            !entityTypeMatch(instance.entity.type, entityTypes.widgets.frame)
          ) {
            return of(false);
          } else {
            const frame = instance as FrameWidgetInstance;
            return combineLatestOrEmpty([
              frame.entity.fragmentId$,
              frame.fragment$.pipe(
                switchMap(
                  (fragment) => fragment?.entity.component.props$ ?? of([]),
                ),
                map((props) => props.length),
              ),
            ]).pipe(
              map(([fragmentId, propsLength]) => {
                return !fragmentId && propsLength;
              }),
            );
          }
        }),
      ).pipe(
        map((values) => {
          return values.every((value) => value);
        }),
      );
    },
  },
  frameData: {
    id: "elementa.sheets.frame.data",
    title: "Data",
    render: FrameComponentDataSheet,
    enabled: ({ instances }) => {
      return instances.every(
        (instance) =>
          entityTypeMatch(instance.entity.type, entityTypes.widgets.frame) &&
          (instance as FrameWidgetInstance).entity.fragmentId,
      );
    },
    enabled$: ({ instances }) => {
      return combineLatestOrEmpty(
        instances.map((instance) => {
          if (
            !entityTypeMatch(instance.entity.type, entityTypes.widgets.frame)
          ) {
            return of(false);
          } else {
            const frame = instance as FrameWidgetInstance;
            return frame.entity.fragmentId$.pipe(
              map((fragmentId) => {
                return !!fragmentId;
              }),
            );
          }
        }),
      ).pipe(
        map((values) => {
          return values.every((value) => value);
        }),
      );
    },
  },
  frameLayout: {
    id: "elementa.sheets.frame.layout",
    title: "Layout",
    render: FrameLayoutControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameText: {
    id: "elementa.sheets.frame.text",
    title: "Text",
    render: FrameTextControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameStyle: {
    id: "elementa.sheets.frame.style",
    title: "Style",
    render: FrameStyleControlSheet,
    enabled: ({ selection }) => {
      return selection.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },

  // element

  elementPosition: {
    id: "elementa.sheets.element.position",
    title: "Position",
    render: ElementPositionControlSheet,
    enabled: ({ instances }) => {
      return instances.every((handle) =>
        entityTypeMatch(handle.entity.type, entityTypes.element),
      );
    },
  },
  elementBox: {
    id: "elementa.sheets.element.box",
    title: "Box",
    render: ElementSizeControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.element),
      );
    },
  },
  elementAppearances: {
    id: "elementa.sheets.element.appearances",
    title: "Appearances",
    render: ElementAppearancesControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.element),
      );
    },
  },
  elementStyle: {
    id: "elementa.sheets.element.style",
    title: "Style",
    render: ElementStyleControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.element),
      );
    },
  },
  elementEffects: {
    id: "elementa.sheets.element.effects",
    title: "Effects",
    render: ElementEffectsControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.element),
      );
    },
  },
  elementTransitions: {
    id: "elementa.sheets.element.transitions",
    title: "Transitions",
    render: ElementTransitionsControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.element),
      );
    },
  },

  // container

  containerLayout: {
    id: "elementa.sheets.layout",
    title: "Layout",
    render: LayoutControlSheet,
    enabled: ({ instances }) => {
      return instances.every(
        (instance) =>
          entityTypeMatch(instance.entity.type, entityTypes.elements.container), //&&
        // instance.children.length > 0,
      );
    },
  },
  containerText: {
    id: "elementa.sheets.container-text",
    title: "Text",
    render: ContainerTextControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.elements.container),
      );
    },
  },

  // text

  text: {
    id: "elementa.sheets.text",
    title: "Text",
    render: TextControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.elements.text),
      );
    },
  },

  // vector

  vector: {
    id: "elementa.sheets.vector",
    title: "Vector",
    render: VectorControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.elements.vector),
      );
    },
  },

  // content

  media: {
    id: "elementa.sheet.content",
    title: "Media",
    render: MediaSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.elements.media),
      );
    },
  },

  // component element

  componentElementProps: {
    id: "elementa.sheet.props",
    title: "Props",
    render: PropsSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) => {
        return entityTypeMatch(
          instance.entity.type,
          entityTypes.elements.component,
        );
      });
    },
  },
  componentElementStylesheets: {
    id: "elementa.sheet.component.stylesheets",
    title: "Stylesheets",
    render: CodeStylesheetSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) => {
        return entityTypeMatch(
          instance.entity.type,
          entityTypes.elements.component,
        );
      });
    },
  },

  // array

  array: {
    id: "elementa.sheets.properties.array",
    title: "Array",
    render: ArrayControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) =>
        entityTypeMatch(instance.entity.type, entityTypes.elements.array),
      );
    },
  },

  // animations
  elementAnimations: {
    id: "elementa.sheets.element.animations",
    title: "Animations",
    render: ElementAnimationsControlSheet,
  },

  // stylesheets
  elementStylesheets: {
    id: "elementa.sheets.element.stylesheets",
    title: "Stylesheets",
    render: ElementStylesheetsControlSheet,
  },

  ...Object.fromEntries(
    Object.entries(projectSheets).map(([key, sheet]) => [
      "project:" + key,
      sheet,
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(elementAppearancesSheets).map(([key, sheet]) => [
      "element:appearances:" + key,
      sheet,
    ]),
  ),
} satisfies Record<
  string,
  SheetView<{
    selection: Handle[];
    instances: Instance[];
  }>
>;
