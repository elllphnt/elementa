import { elllIcons16, Icon } from "@repo/components";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElllProject } from "~/src/hooks/project/project";
import { BriefEditor } from "./brief_editor";

export function Brief({ onCompleted }: { onCompleted?: () => void }) {
  const repository = useRepository();
  const project = useElllProject();

  return (
    <div
      style={{
        width: "calc(100vw - 48px)",
        height: "calc(100vh - 48px)",
        maxWidth: 960,
        maxHeight: 640,
      }}
      className="el-flex"
    >
      <div className="el-grow">
        <BriefEditor />
      </div>
      <div
        className="el-flex el-flex-col el-gap-4 el-p-4 el-bg-bg-100"
        style={{
          maxWidth: 300,
          flexShrink: 0,
          height: "100%",
        }}
      >
        <h1 className="el-font-semibold">Brief</h1>
        <p className="el-text-fg-400">
          The Brief captures your project's purpose.
          <br />
          Add a title, a short description, and user goals to shape what you're
          building.
        </p>
        <div className="el-mt-auto el-flex el-justify-end">
          <button
            className="el-px-2 el-h-7 el-rounded el-bg-pm el-flex el-items-center el-gap-1"
            onClick={onCompleted}
          >
            <Icon name={elllIcons16.ai} style={{ height: "1em" }} />
            Generate Project
          </button>
        </div>
      </div>
    </div>
  );
}
