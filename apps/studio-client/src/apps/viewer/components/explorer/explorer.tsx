import { Folder, TableOfContents } from "lucide-react";
import { IconButton } from "../../../../components/icon_button";
import { useViewerState } from "../../state";
import { Infrastructure } from "./infrastructure/infrastructure";
import { Outline } from "./outline/outline";

const tabs = [
  {
    id: "infrastructure",
    label: "Infrastructure",
    Icon: Folder,
    View: Infrastructure,
  },
  {
    id: "outline",
    label: "Outline",
    Icon: TableOfContents,
    View: Outline,
  },
];

function NoActiveTab() {
  return (
    <div className="flex h-full w-full items-center text-center justify-center">
      <div className="text-gray-500">
        <div className="text-6xl mb-4">📂</div>
        <div className="text-xl mb-2">No active tab</div>
        <div className="text-sm">Please select a tab to view its content</div>
      </div>
    </div>
  );
}

export function Explorer() {
  const { explorer, setExplorerTab } = useViewerState();
  const activeTabIndex = tabs.findIndex((tab) => tab.id === explorer.tab);
  const ActiveView = tabs[activeTabIndex]?.View || NoActiveTab;

  const handleTabChange = (index: number) => {
    setExplorerTab(tabs[index].id);
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
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <ActiveView />
      </div>
    </div>
  );
}
