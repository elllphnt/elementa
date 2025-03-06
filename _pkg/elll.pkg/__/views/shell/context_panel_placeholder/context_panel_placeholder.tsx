import { elllIcons16 } from "@repo/components";
import TabContainer from "../../../components/tab/tab_container";
import { contextViews } from "../../contexts/_";

export function ContextPanelPlaceholderView(): JSX.Element {
  return (
    <TabContainer
      stateKey={["elementa", "context"]}
      useIcon
      tabs={[
        {
          key: "copilot",
          viewId: contextViews.copilot.id,
          name: "Copilot",
          icon: elllIcons16.ai,
        },
      ]}
      hr
    />
  );
}
