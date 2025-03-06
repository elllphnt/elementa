import { accessibilityUtilities } from "./utilities/accessibility";
import { backgroundUtilities } from "./utilities/backgrounds";
import { borderUtilities } from "./utilities/borders";
import { effectUtilities } from "./utilities/effects";
import { filterUtilities } from "./utilities/filters";
import { flexGridUtilities } from "./utilities/flex_grid";
import { interactivityUtilities } from "./utilities/interactivity";
import { layoutUtilities } from "./utilities/layout";
import { sizingUtilities } from "./utilities/sizing";
import { spacingUtilities } from "./utilities/spacing";
import { svgUtilities } from "./utilities/svg";
import { tableUtilities } from "./utilities/table";
import { transformUtilities } from "./utilities/transform";
import { transitionAnimationUtilities } from "./utilities/transition_animations";
import { typographyUtilities } from "./utilities/typography";
import { TailwindVariableSetIds } from "./variables";

export function tailwindUtilities({
  variableSetIds,
}: {
  variableSetIds: TailwindVariableSetIds;
}): any[] {
  return [
    ...layoutUtilities({ variableSetIds }),
    ...flexGridUtilities({ variableSetIds }),
    ...spacingUtilities({ variableSetIds }),
    ...sizingUtilities({ variableSetIds }),
    ...typographyUtilities({ variableSetIds }),
    ...backgroundUtilities({ variableSetIds }),
    ...borderUtilities({ variableSetIds }),
    ...effectUtilities({ variableSetIds }),
    ...filterUtilities({ variableSetIds }),
    ...tableUtilities({ variableSetIds }),
    ...transitionAnimationUtilities({ variableSetIds }),
    ...transformUtilities({ variableSetIds }),
    ...interactivityUtilities({ variableSetIds }),
    ...svgUtilities({ variableSetIds }),
    ...accessibilityUtilities({ variableSetIds }),
  ];
}
