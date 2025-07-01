import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface StyleAdapterCardProps {
  styleAdapter: {
    key: string;
    target: string;
    htmlStyleElements: HTMLStyleElement[];
    cssStyleSheets: CSSStyleSheet[];
  };
  index: number;
  refreshCounter: number;
}

export function StyleAdapterCard({
  styleAdapter,
  index,
  refreshCounter,
}: StyleAdapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getCssText = () => {
    try {
      return styleAdapter.htmlStyleElements
        .map((element: HTMLStyleElement) => {
          if (!element.sheet) return "";
          const rules = element.sheet.cssRules;
          const texts: string[] = [];

          for (let i = 0; i < rules.length; ++i) {
            const rule = rules.item(i);
            texts.push(rule?.cssText || "");
          }
          return texts.join("\n\n");
        })
        .join("\n\n")
        .trim();
    } catch {
      return "Error reading CSS content";
    }
  };

  return (
    <div
      key={`${styleAdapter.key}-${refreshCounter}`}
      className="border border-fg-200 rounded-md overflow-hidden"
    >
      {/* Header - always visible */}
      <div
        className="p-3 space-y-2 cursor-pointer hover:bg-fg-50 transition-colors"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-fg-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-fg-500" />
              )}
              <div className="text-xs font-medium text-fg-700">
                Style Adapter #{index + 1}
              </div>
            </div>
            <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
              {styleAdapter.key}
            </div>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-fg-600">Target:</span>
            <span className="font-mono text-xs bg-fg-50 px-1 rounded">
              {styleAdapter.target}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-fg-600">Style Elements:</span>
            <span className="text-xs">
              {styleAdapter.htmlStyleElements.length}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-fg-600">Stylesheets:</span>
            <span className="text-xs">
              {styleAdapter.cssStyleSheets.length}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-fg-200 bg-fg-50">
          {/* CSS Rules section */}
          {styleAdapter.cssStyleSheets.length > 0 && (
            <div className="p-3 border-b border-fg-200">
              <div className="text-xs font-medium text-fg-700 mb-2">
                CSS Rules:
              </div>
              <div className="space-y-1">
                {styleAdapter.cssStyleSheets
                  .slice(0, 5)
                  .map((sheet: CSSStyleSheet, sheetIndex: number) => (
                    <div key={sheetIndex} className="text-xs text-fg-600">
                      Sheet {sheetIndex + 1}: {sheet.cssRules.length} rules
                    </div>
                  ))}
                {styleAdapter.cssStyleSheets.length > 5 && (
                  <div className="text-xs text-fg-500">
                    +{styleAdapter.cssStyleSheets.length - 5} more sheets
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CSS Content section */}
          <div className="px-3">
            <div className="py-3 border-b border-fg-200 text-xs font-medium text-fg-700">
              CSS Content:
            </div>
            {styleAdapter.htmlStyleElements.length > 0 ? (
              <div className="py-3 max-h-48 overflow-y-auto">
                <pre className="text-xs text-fg-800 whitespace-pre-wrap font-mono">
                  {getCssText() || "(empty)"}
                </pre>
              </div>
            ) : (
              <div className="text-xs text-fg-500 italic">
                No style elements found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
