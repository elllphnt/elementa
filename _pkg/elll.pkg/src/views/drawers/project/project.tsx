import { ScrollArea, TextControl } from "@repo/components";
import { CopyControl } from "~/src/components/ui/controls/_uncertain/copy/copy";
import { useRepository } from "~/src/hooks/backend/repository";

export function ProjectView(): JSX.Element {
  const repository = useRepository();

  return (
    <ScrollArea
      scrollY
      containerClassName="el-flex el-flex-col el-p-2 el-space-y-4"
    >
      <div className="el-space-y-1">
        <label className="el-text-fg-400">Title</label>
        <TextControl
          value={repository?.name}
          value$={repository?.name$}
          onChange={(value) => repository?.setName(value || "")}
          settings={{
            placeholder: "Untitled",
          }}
        />
      </div>
      <div className="el-space-y-1">
        <label className="el-text el-text-fg-400">Repository ID</label>
        <CopyControl value={repository?.id ?? ""} className="el-font-mono" />
      </div>
    </ScrollArea>
  );
}
