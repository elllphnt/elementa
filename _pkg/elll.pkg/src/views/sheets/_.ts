import { entityTypeMatch, entityTypes } from "@elllphnt/elll-element";
import { Instance } from "@repo/elementa";
import {
  EntityHandle,
  Handle,
  handleProperties,
} from "@repo/elementa-interactor";
import { SheetView } from "~/src/components/ui/sheets/types";
import { RenderableAlignControlSheet } from "./alignment";
import { PropsSheet } from "./element/props";
import { RepeatControlSheet } from "./element/repeat";
import { FrameControl } from "./frame/frame";
import { FrameStyleControlSheet } from "./frame/style";
import { FrameViewportSheet } from "./frame/viewport";
import { FrameComponentPropsSheet } from "./frame/props";

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
      return selection.every(
        (instance) =>
          instance instanceof EntityHandle &&
          entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameViewport: {
    id: "elementa.sheet.frame.viewport",
    title: "Viewport",
    render: FrameViewportSheet,
    enabled: ({ selection }) => {
      return selection.every(
        (instance) =>
          instance instanceof EntityHandle &&
          entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameProps: {
    id: "elementa.sheet.frame.props",
    title: "Props",
    render: FrameComponentPropsSheet,
    enabled: ({ selection }) => {
      return selection.every(
        (instance) =>
          instance instanceof EntityHandle &&
          entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },
  frameStyle: {
    id: "elementa.sheets.frame.style",
    title: "Style",
    render: FrameStyleControlSheet,
    enabled: ({ selection }) => {
      return selection.every(
        (instance) =>
          instance instanceof EntityHandle &&
          entityTypeMatch(instance.entity.type, entityTypes.widgets.frame),
      );
    },
  },

  // element
  componentElementProps: {
    id: "elementa.sheet.props",
    title: "Props",
    render: PropsSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) => {
        return (
          entityTypeMatch(
            instance.entity.type,
            entityTypes.elements.component,
          ) ||
          entityTypeMatch(instance.entity.type, entityTypes.elements.primitive)
        );
      });
    },
  },
  elementRepeat: {
    id: "elementa.sheet.repeat",
    title: "Repeat",
    render: RepeatControlSheet,
    enabled: ({ instances }) => {
      return instances.every((instance) => {
        return entityTypeMatch(instance.entity.type, entityTypes.element);
      });
    },
  },
} satisfies Record<
  string,
  SheetView<{
    selection: Handle[];
    instances: Instance[];
  }>
>;
