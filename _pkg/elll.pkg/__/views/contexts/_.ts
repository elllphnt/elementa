import { View } from "@repo/shell";
import { IssuesPanel } from "./console/console";
import { CopilotPanel } from "./copilot/copilot";
import { PropertiesPanel } from "./properties/design";
import { InteractionsPanel } from "./interactions/interactions";
import { ProjectContextPanel } from "./project/project";
import { StylesPanel } from "./styles/styles";

export const contextViews = {
  copilot: {
    id: "elementa.context.copilot",
    render: CopilotPanel,
  },
  interactions: {
    id: "elementa.context.interactions",
    render: InteractionsPanel,
  },
  properties: {
    id: "elementa.context.properties",
    render: PropertiesPanel,
  },
  styles: {
    id: "elementa.context.style",
    render: StylesPanel,
  },
  project: {
    id: "elementa.context.project",
    render: ProjectContextPanel,
  },
  console: {
    id: "elementa.context.console",
    render: IssuesPanel,
  },
} satisfies Record<string, View>;
