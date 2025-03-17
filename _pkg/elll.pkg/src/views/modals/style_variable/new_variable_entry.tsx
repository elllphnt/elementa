import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { useCallback, useState } from "react";

export function NewVariableEntry({
  onCompleted,
}: {
  onCompleted?: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const handleComplete = useCallback(async () => {
    onCompleted?.(name);
  }, [name]);

  return (
    <TreeEntry icon={<Icon name={elllIcons16.variable} />}>
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
