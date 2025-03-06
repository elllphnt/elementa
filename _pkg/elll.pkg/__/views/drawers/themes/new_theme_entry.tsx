import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { useCallback, useState } from "react";

export function NewThemeEntry({
  onCompleted,
}: {
  onCompleted?: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = useCallback(async () => {
    try {
      setLoading(true);
      await onCompleted?.(name);
    } finally {
      setLoading(false);
    }
  }, [name]);

  return (
    <TreeEntry loading={loading} icon={<Icon name={elllIcons16.variable} />}>
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
