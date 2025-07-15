import { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import { RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { StyleAdapterCard } from "./style_adapter_card.js";

interface StyleProps {
  manager: ElementaRenderableManager | null;
}

export function Style({ manager }: StyleProps) {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  if (!manager) {
    return (
      <div className="flex h-full w-full items-center text-center justify-center">
        <div className="text-fg-500">
          <div className="text-4xl mb-2">🎨</div>
          <div className="text-sm">No component selected</div>
        </div>
      </div>
    );
  }

  const styles = Object.values(
    manager.scene.stylesheetDomManager.stylesheetAdaptors
  );

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0 px-4">
        <h3 className="text-sm font-medium">Style Adapters</h3>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-fg-100 hover:bg-fg-200 rounded transition-colors"
          title="Refresh styles"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 px-4 pb-4">
        {styles.length === 0 ? (
          <div className="text-center py-8 text-fg-500">
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm">No style adapters found</div>
          </div>
        ) : (
          styles.map((styleAdapter, index) => (
            <StyleAdapterCard
              key={`${styleAdapter.key}-${refreshCounter}`}
              styleAdapter={styleAdapter}
              index={index}
              refreshCounter={refreshCounter}
            />
          ))
        )}
      </div>
    </div>
  );
}
