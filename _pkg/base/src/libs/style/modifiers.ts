import {
  StyleDataType,
  StyleModifierDefinitionData,
  StyleModifierType,
} from "../../types/_.js";

export const systemModifiers = {
  condition: {
    id: "system:condition",
    name: "condition",
    type: StyleModifierType.Element,
    signature: [StyleDataType.String],
    selector: [".elll-condition-$1"],
  },
} satisfies Record<string, StyleModifierDefinitionData>;
