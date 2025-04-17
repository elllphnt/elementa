import { useRepository } from "~/src/hooks/backend/repository";
import { useElllProject } from "~/src/hooks/project/project";
import { BriefEditor } from "./brief_editor";

export function BriefBoardView({ onCompleted }: { onCompleted?: () => void }) {
  const repository = useRepository();
  const project = useElllProject();

  return (
    <div style={{ pointerEvents: "auto", height: "100%", width: "100%" }}>
      <BriefEditor />
    </div>
  );
}
