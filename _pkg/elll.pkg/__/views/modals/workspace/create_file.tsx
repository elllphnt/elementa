import { File } from "@repo/backend";
import { Icon, TreeEntry, elllIcons16 } from "@repo/components";
import { useCallback, useState } from "react";
import FileIcon from "../../../components/file_icon";
import { useWorkspaceFileAtPath } from "../../../hooks/backend/file";

export function CreateFileView({
  path,
  type,
  typeName,
  onFile,
}: {
  path: string;
  type: string;
  typeName?: string;
  onFile?: (file: File) => void;
  onCancel?: () => void;
}): JSX.Element {
  const [directory] = useWorkspaceFileAtPath(path, {
    type: "directory",
  });
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleCreate = useCallback(async () => {
    if (!directory || !name) {
      return;
    }

    setCreating(true);
    try {
      const file = await directory.createEntry({ name, type });
      onFile?.(file);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setCreating(false);
    }
  }, [name]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
      style={{
        width: 320,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      className="el-p-3 el-space-y-4"
    >
      <div className="el-font-semibold el-text-nowrap el-text-ellipsis">
        Creating a new
        <span className="el-font-mono el-bg-bg-500/10 el-rounded el-p1 el-mx-1">
          {typeName || type}
        </span>
      </div>

      <div className="el-space-y-1">
        <div>Directory</div>
        <TreeEntry icon={<Icon name={elllIcons16.folderOpen} />}>
          /{path}
        </TreeEntry>
      </div>

      {error && <div className="el-text-red-500">{error}</div>}

      <div className="el-space-y-1">
        <div>Name</div>

        <TreeEntry icon={<FileIcon type={type} />} loading={creating}>
          <input
            autoComplete="off"
            style={{
              width: "100%",
              outline: "none",
            }}
            type="text"
            placeholder={`name`}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </TreeEntry>
      </div>

      <div className="el-flex el-justify-end el-space-x-2">
        <button
          type="submit"
          className="el-px-4 el-h-7 el-bg-pm el-text-pm-ctr el-rounded disabled:el-bg-bg-500/10 disabled:el-text-fg-500/50"
          disabled={!name}
        >
          Create
        </button>
      </div>
    </form>
  );
}
