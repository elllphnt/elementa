import { TreeEntry } from "@repo/components";
import { useCallback, useContext, useState } from "react";
import { FileTreeContext } from "./_contexts";
import FileIcon from "../../icons/file_icon";

export function FileTreeNewEntry() {
  const context = useContext(FileTreeContext);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const newEntry = context?.newEntry;
  if (!newEntry) return null;

  const handleComplete = useCallback(async () => {
    if (!name.trim()) {
      context.setNewEntry?.(undefined);
      return;
    }
    try {
      setLoading(true);
      await context.handleNewEntry?.({
        parent: newEntry.parent,
        type: newEntry.type,
        name,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        context.setNewEntry?.(undefined);
      });
      setLoading(false);
    }
  }, [name]);

  return (
    <TreeEntry
      nested
      loading={loading}
      icon={<FileIcon type={newEntry.type} />}
    >
      <input
        autoFocus
        type="text"
        value={name}
        style={{
          width: "100%",
          outline: "none",
        }}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onBlur={handleComplete}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            e.currentTarget.blur();
          }
        }}
      />
    </TreeEntry>
  );
}
