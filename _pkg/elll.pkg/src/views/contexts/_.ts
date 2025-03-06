import { View } from "@repo/shell";
import { keys } from "~/src/libs/keys";
import { ConsolePanel } from "./console/console";
import { CopilotPanel } from "./copilot/copilot";
import { PropertiesPanel } from "./properties/properties";
import { ReactPreview } from "./react_preview/react_preview";
import { StylesheetPanel } from "./stylesheet/stylesheet";

export const contextViews = {
  copilot: {
    id: keys.views.copilot,
    render: CopilotPanel,
  },
  console: {
    id: keys.views.console,
    render: ConsolePanel,
  },
  properties: {
    id: keys.views.properties,
    render: PropertiesPanel,
  },
  stylesheet: {
    id: keys.views.stylesheet,
    render: StylesheetPanel,
  },
  reactPreview: {
    id: keys.views.reactPreview,
    render: ReactPreview,
  },
} satisfies Record<string, View>;
