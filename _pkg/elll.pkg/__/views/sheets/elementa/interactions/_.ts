import {
  ControllerWidget,
  ControllerWidgetHandle,
  ElementInstance,
  Handle,
  handleProperties,
  Instance,
  RepeatTransformerControllerWidget,
  SwitchTransformerControllerWidget,
} from "@repo/elementa";
import { SheetView } from "../../../../components/sheet/types";
import { RenderableAlignControlSheet } from "../_common/renderables/alignment";
import { RepeatControllerSheet } from "./controllers/repeat";
import { SwitchControllerSheet } from "./controllers/switch";
import { ElementInteractionsSheet } from "./interactions/interactions";
import { LinkSheet } from "./link/link";

export const elementaInteractionSheets = {
  alignment: {
    id: "elementa.sheets.renderable.alignment",
    title: "Alignment",
    order: 0,
    render: RenderableAlignControlSheet,
    enabled: ({ selection }) => {
      return (
        selection.length > 1 &&
        selection.every((handle) => handle.property(handleProperties.isMovable))
      );
    },
  },
  switch: {
    id: "elementa.sheets.controller.switch",
    title: "Switch",
    order: 0,
    render: SwitchControllerSheet,
    enabled: ({ selection }) => {
      return (
        selection.length > 0 &&
        selection.every(
          (handle) =>
            handle instanceof ControllerWidgetHandle &&
            (handle.entity as ControllerWidget).target instanceof
              SwitchTransformerControllerWidget,
        )
      );
    },
  },
  repeat: {
    id: "elementa.sheets.controller.repeat",
    title: "Repeat",
    order: 0,
    render: RepeatControllerSheet,
    enabled: ({ selection }) => {
      return (
        selection.length > 0 &&
        selection.every(
          (handle) =>
            handle instanceof ControllerWidgetHandle &&
            (handle.entity as ControllerWidget) instanceof
              RepeatTransformerControllerWidget,
        )
      );
    },
  },
  link: {
    id: "elementa.sheets.interactions.link",
    title: "Link",
    render: LinkSheet,
    enabled: ({ instances }) => {
      return (
        instances.length === 1 &&
        instances.every((instance) => instance instanceof ElementInstance)
      );
    },
  },
  interaction: {
    id: "elementa.sheets.interactions",
    title: "Interactions",
    render: ElementInteractionsSheet,
    enabled: ({ instances }) => {
      return (
        instances.length === 1 &&
        instances.every((instance) => instance instanceof ElementInstance)
      );
    },
  },
} satisfies Record<
  string,
  SheetView<{
    instances: Instance[];
    selection: Handle[];
  }>
>;
