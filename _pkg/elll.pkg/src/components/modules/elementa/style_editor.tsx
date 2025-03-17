import { ControlMenuAffinityProvider } from "@repo/components";
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
import { StyleEffectsControlSheet } from "~/src/views/sheets/style/effects";
import { StylePropertiesControlSheet } from "~/src/views/sheets/style/style_properties/style_properties";
import { Sheet } from "../../ui/sheets/sheet";

const styleEditorSections = {
  position: "position",
  box: "box",
  layout: "layout",
  text: "text",
  appearance: "appearance",
  transform: "transform",
  effect: "effect",
  transition: "transition",
  animation: "animation",
};

const sections: Array<{
  key: string;
  title: string;
  properties: Array<StylePropertyGroupConfig>;
}> = [
  {
    key: styleEditorSections.position,
    title: "Position",
    properties: positionStylePropertyControls,
  },
  {
    key: styleEditorSections.box,
    title: "Box",
    properties: boxStylePropertyControls,
  },
  {
    key: styleEditorSections.layout,
    title: "Layout",
    properties: layoutStylePropertyControls,
  },
  {
    key: styleEditorSections.text,
    title: "Text",
    properties: textStylePropertyControls,
  },
  {
    key: styleEditorSections.appearance,
    title: "Appearance",
    properties: appearancesStylePropertyControls,
  },
  {
    key: styleEditorSections.transform,
    title: "Transform",
    properties: transformStylePropertyControls,
  },
  {
    key: styleEditorSections.transition,
    title: "Transition",
    properties: transitionStylePropertyControls,
  },
];

export type StyleEdtitorSection = keyof typeof styleEditorSections;

export function StyleEditor({
  styles,
  disabled,
}: {
  styles: Style[];
  disabled?: StyleEdtitorSection[];
}): JSX.Element {
  const enabledSections = { ...styleEditorSections };
  for (const section of disabled ?? []) {
    delete enabledSections[section];
  }

  let additionalSectionsWithSideMenu: React.ReactNode[] = [];
  const additionalSectionsWithDefaultMenu: React.ReactNode[] = [];

  if (enabledSections.effect) {
    additionalSectionsWithSideMenu.push(
      <React.Fragment key="effects">
        <hr />
        <Sheet title="Effects">
          <StyleEffectsControlSheet />
        </Sheet>
      </React.Fragment>,
    );
  }

  if (enabledSections.animation) {
    additionalSectionsWithDefaultMenu.push(
      <React.Fragment key="animations">
        <hr />
        <Sheet title="Animations">
          <StyleAnimationsControlSheet />
        </Sheet>
      </React.Fragment>,
    );
  }

  return (
    <div style={{ width: "100%", height: "fit-content" }}>
      <ControlMenuAffinityProvider affinity="side">
        {sections
          .filter((section) => section.key in enabledSections)
          .map((section, index) => (
            <React.Fragment key={section.title}>
              {index > 0 && <hr />}
              <Sheet title={section.title}>
                <StylePropertiesControlSheet
                  styles={styles}
                  properties={section.properties}
                />
              </Sheet>
            </React.Fragment>
          ))}
        {additionalSectionsWithSideMenu}
      </ControlMenuAffinityProvider>
      {additionalSectionsWithDefaultMenu}
    </div>
  );
}
