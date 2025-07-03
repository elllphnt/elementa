import { useObservable } from "@elllphnt/elementa-react-utils";
import { AlertTriangle, Palette } from "lucide-react";
import { IconButton } from "../../../../components/icon_button";
import { sceneManager, useViewerState } from "../../state";
import { Problems } from "./problems/problems";
import { Style } from "./style/style";

const tabs = [
  {
    id: "style",
    label: "Style",
    Icon: Palette,
    View: Style,
  },
  {
    id: "problems",
    label: "Problems",
    Icon: AlertTriangle,
    View: Problems,
  },
];

function NoActiveTab() {
  return (
    <div className="flex h-full w-full items-center text-center justify-center">
      <div className="text-fg-500">
        <div className="text-6xl mb-4">🔍</div>
        <div className="text-xl mb-2">No active tab</div>
        <div className="text-sm">Please select a tab to view its content</div>
      </div>
    </div>
  );
}

export function Inspector() {
  const manager = useObservable(
    sceneManager.asObservable(),
    sceneManager.getValue()
  );
  const { inspector, setInspectorTab } = useViewerState();
  const activeTabIndex = tabs.findIndex((tab) => tab.id === inspector.tab);
  const ActiveView = tabs[activeTabIndex]?.View || NoActiveTab;

  const handleTabChange = (index: number) => {
    setInspectorTab(tabs[index].id);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex items-center gap-2 px-4 pt-4">
        {tabs.map((tab, index) => (
          <IconButton
            key={tab.id}
            onClick={() => handleTabChange(index)}
            active={activeTabIndex === index}
            icon={<tab.Icon className="h-4 w-4" />}
            label={tab.label}
          />
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {manager ? <ActiveView manager={manager} /> : <></>}
      </div>
    </div>
  );
}
