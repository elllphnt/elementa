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
import { SheetView } from "~/src/components/sheet/types";
import { RenderableAlignControlSheet } from "./alignment";
import { FrameControl } from "./frame/frame";
import { FrameStyleControlSheet } from "./frame/style";
import { FrameViewportSheet } from "./frame/viewport";

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
} satisfies Record<
  string,
  SheetView<{
    selection: Handle[];
    instances: Instance[];
  }>
>;
