import { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface ProblemsProps {
  manager: ElementaRenderableManager | null;
}

interface Problem {
  id: string;
  type: "error" | "warning" | "info";
  message: string;
  line?: number;
  column?: number;
}

// Mock problems data - in a real implementation, this would come from the manager
const mockProblems: Problem[] = [
  {
    id: "1",
    type: "warning",
    message: "Missing alt attribute for image element",
    line: 12,
    column: 8,
  },
  {
    id: "2",
    type: "error",
    message: "Undefined variable 'backgroundColor'",
    line: 25,
    column: 15,
  },
  {
    id: "3",
    type: "info",
    message: "Consider using semantic HTML elements",
    line: 8,
    column: 4,
  },
];

function getProblemIcon(type: Problem["type"]) {
  switch (type) {
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    default:
      return <Info className="h-4 w-4 text-fg-500" />;
  }
}

function getProblemBgColor(type: Problem["type"]) {
  switch (type) {
    case "error":
      return "bg-red-50 border-red-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "info":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-fg-50 border-fg-200";
  }
}

export function Problems({ manager }: ProblemsProps) {
  // In a real implementation, you would extract problems from the manager
  const problems = manager ? mockProblems : [];

  if (!manager) {
    return (
      <div className="flex h-full w-full items-center text-center justify-center">
        <div className="text-fg-500">
          <div className="text-4xl mb-2">🔍</div>
          <div className="text-sm">No component selected</div>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="flex h-full w-full items-center text-center justify-center">
        <div className="text-fg-500">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
          <div className="text-sm">No problems found</div>
        </div>
      </div>
    );
  }

  const errorCount = problems.filter((p) => p.type === "error").length;
  const warningCount = problems.filter((p) => p.type === "warning").length;
  const infoCount = problems.filter((p) => p.type === "info").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Problems</h3>
        <div className="flex items-center gap-2 text-xs">
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-red-600">
              <XCircle className="h-3 w-3" />
              {errorCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              {warningCount}
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-blue-600">
              <Info className="h-3 w-3" />
              {infoCount}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className={`p-3 rounded-md border ${getProblemBgColor(
              problem.type
            )}`}
          >
            <div className="flex items-start gap-2">
              {getProblemIcon(problem.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-fg-900 break-words">
                  {problem.message}
                </p>
                {(problem.line || problem.column) && (
                  <p className="text-xs text-fg-500 mt-1">
                    Line {problem.line}
                    {problem.column && `, Column ${problem.column}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
