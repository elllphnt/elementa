import { TextAreaControl, TextControl } from "@repo/components";
import { useRepository } from "~/src/hooks/backend/repository";
import { useElllProject } from "~/src/hooks/project/project";
import { FeatureEditor } from "./feature_editor";

export function ProjectSpec({ onCompleted }: { onCompleted?: () => void }) {
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
      <div
        className="el-flex el-flex-col el-gap-4 el-p-4 el-bg-bg-100"
        style={{
          maxWidth: 300,
          height: "100%",
        }}
      >
        <h1 className="el-font-semibold">Project Specification</h1>
        <p className="el-text-fg-400">
          Tailor the feature list to align with your application's needs. You
          can also update the project description to regenerate a new feature
          list that better suits your vision.
        </p>
        <div className="el-space-y-3">
          <div className="el-space-y-1">
            <p className="el-text-fg-400">Title</p>
            <TextControl
              value$={repository?.name$}
              value={repository?.name}
              onChange={(value) => repository?.setName(value || "")}
            />
          </div>

          <div className="el-space-y-1">
            <p className="el-text-fg-400">Description</p>
            <TextAreaControl
              value={project.spec.description}
              value$={project.spec.description$}
              onChange={(value) => project.spec.setDescription(value || "")}
              settings={{
                minRows: 2,
                maxRows: 6,
              }}
            />
          </div>
        </div>
        <div className="el-mt-auto el-flex el-justify-between">
          {onCompleted ? (
            <button
              className="el-px-2 el-h-7 el-rounded el-bg-bg-200"
              onClick={onCompleted}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="el-grow">
        <FeatureEditor />
      </div>
    </div>
  );
}
