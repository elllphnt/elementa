import { Style } from "@repo/elementa-models";
import React from "react";
import {
  appearancesStylePropertyControls,
  boxStylePropertyControls,
  layoutStylePropertyControls,
  positionStylePropertyControls,
  StylePropertyGroupConfig,
  textStylePropertyControls,
  transformStylePropertyControls,
  transitionStylePropertyControls,
} from "~/src/modules/elementa/style/properties";
import { StyleAnimationsControlSheet } from "~/src/views/sheets/style/animations";
import { BackgroundControlSheet } from "~/src/views/sheets/style/background";
import { StyleEffectsControlSheet } from "~/src/views/sheets/style/effects";
import { StylePropertiesControlSheet } from "~/src/views/sheets/style/style_properties/style_properties";
import { Sheet } from "../../ui/sheets/sheet";

const styleEditorSections = {
  position: {
    type: "property-group",
    title: "Position",
    properties: positionStylePropertyControls,
  },
  box: {
    type: "property-group",
    title: "Box",
    properties: boxStylePropertyControls,
  },
  layout: {
    type: "property-group",
    title: "Layout",
    properties: layoutStylePropertyControls,
  },
  text: {
    type: "property-group",
    title: "Text",
    properties: textStylePropertyControls,
  },
  background: {
    type: "sheet",
    title: "Background",
    sheet: BackgroundControlSheet,
  },
  appearance: {
    type: "property-group",
    title: "Appearance",
    properties: appearancesStylePropertyControls,
  },
  transform: {
    type: "property-group",
    title: "Transform",
    properties: transformStylePropertyControls,
  },
  effect: {
    type: "sheet",
    title: "Effects",
    sheet: StyleEffectsControlSheet,
  },
  transition: {
    type: "property-group",
    title: "Transition",
    properties: transitionStylePropertyControls,
  },
  animation: {
    type: "sheet",
    title: "Animations",
    sheet: StyleAnimationsControlSheet,
  },
} satisfies Record<
  string,
  | {
      type: "property-group";
      title: string;
      properties: Array<StylePropertyGroupConfig>;
    }
  | {
      type: "sheet";
      title: string;
      sheet: React.ComponentType<{ styles: Style[] }>;
    }
>;

export type StyleEdtitorSection = keyof typeof styleEditorSections;

function StyleEditorSection({
  name,
  styles,
}: {
  name: StyleEdtitorSection;
  styles: Style[];
}): JSX.Element {
  const section = styleEditorSections[name];
  if (section.type === "property-group") {
    return (
      <Sheet title={section.title}>
        <StylePropertiesControlSheet
          styles={styles}
          properties={section.properties}
        />
      </Sheet>
    );
  } else {
    return (
      <Sheet title={section.title}>
        <section.sheet styles={styles} />
      </Sheet>
    );
  }
}
export function StyleEditor({
  styles,
  sections,
}: {
  styles: Style[];
  sections: StyleEdtitorSection[];
}): JSX.Element {
  return (
    <div style={{ width: "100%", height: "fit-content" }}>
      {sections.map((section, index) => (
        <React.Fragment key={section}>
          {index > 0 && <hr />}
          <StyleEditorSection name={section} styles={styles} />
        </React.Fragment>
      ))}
    </div>
  );
}
