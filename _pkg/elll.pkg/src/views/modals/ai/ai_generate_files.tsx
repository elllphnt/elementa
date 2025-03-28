import { File } from "@repo/backend";
import { elllIcons16, Icon, TreeEntry, useControlMenu } from "@repo/components";
import cx from "classnames";
import TextArea from "react-textarea-autosize";
import { useElll } from "~/src/hooks/elll/elll";
import { useWorkspaceState } from "~/src/hooks/shell/workspace";
import { keys } from "~/src/libs/keys";

function PathControl({
  path,
  setPath,
}: {
  path: string;
  setPath: (path: string) => void;
}) {
  const { openMenu, closeMenu } = useControlMenu();
  return (
    <TreeEntry
      className="el-border"
      icon={<Icon name={elllIcons16.folderClosed} />}
      onClick={() => {
        openMenu({
          title: "Select a directory",
          viewId: keys.views.modals.workspaceFileExplorer,
          props: {
            onSelect: (file: File) => {
              if (file.path !== undefined) {
                setPath(file.path);
              }
              closeMenu();
            },
          },
        });
      }}
    >
      {"/" + path}
    </TreeEntry>
  );
}

export function AiGenerateFilesModal({
  path: initialPath = "",
}: {
  path?: string;
}) {
  const elll = useElll();
  const [query, setQuery] = useWorkspaceState(
    ["modals", "AiGenerateFilesModal", "query"],
    "",
  );
  const [path, setPath] = useWorkspaceState(
    ["modals", "AiGenerateFilesModal", "path", initialPath],
    initialPath,
  );

  const handleGenerateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const generation = elll.copilot.generateResources({ query, path });
    elll.shell.showNotification({
      viewId: keys.views.notifications.aiGeneration,
      props: { generation },
      message: "",
    });
    setQuery("");
  };

  return (
    <form
      className="el-p-3 el-rounded el-space-y-3"
      style={{ width: 300 }}
      onSubmit={handleGenerateQuery}
    >
      <PathControl path={path} setPath={setPath} />
      <p className="el-text-fg-400">
        Use AI to generate resources for your project based on a query.
      </p>

      <TextArea
        className="el-w-full el-px-2 el-py-1 el-border border-gray-200 el-rounded el-outline-none el-bg-transparent"
        placeholder="Type your query here..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        maxRows={12}
        style={{
          resize: "none",
        }}
      />

      <div className="el-flex el-gap-2 el-justify-end">
        <button
          type="submit"
          className={cx("el-rounded el-px-2 el-py-1", {
            "el-bg-pm hover:el-bg-pm-400 el-text-pm-ctr": query,
            "el-bg-bg-200/50": !query,
          })}
          disabled={!query}
        >
          Generate
        </button>
      </div>
    </form>
  );
}
