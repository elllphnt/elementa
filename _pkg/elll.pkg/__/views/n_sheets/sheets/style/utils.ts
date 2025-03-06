import { Style } from "@repo/elementa-models";
import { StylePropertyConfig } from "~/src/components/controls/styles/properties";

export function initializeProperties(
  properties: StylePropertyConfig[],
  styles: Style[],
) {
  properties.forEach((property) => {
    initProperty(property, styles);
  });
}

export function addDigitToLowestRank(n: number, d: number) {
  // Check if n is an integer or a float
  if (Number.isInteger(n)) {
    // For integers, simply append the digit as the fractional part
    return parseFloat(`${n}.${d}`);
  } else {
    // For floats, append the digit to the string representation
    return parseFloat(n.toString() + d.toString());
  }
}

function initProperty(property: StylePropertyConfig, styles: Style[]) {
  styles.forEach((style) => {
    style.setProperty(property.name, property.initialValue ?? "unset");

    property.groups?.forEach((group) => {
      group.properties?.forEach((prop) => {
        if (prop.autoInitialize) {
          initProperty(prop, styles);
        }
      });
    });
  });
}
