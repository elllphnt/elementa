import { isReference, Reference } from "@elllphnt/elll-element";
import { ControlProps } from "@repo/components";
import { FileExplorer } from "~/src/components/ui/file_explorer/file_explorer";
import { useDrive } from "~/src/hooks/backend/drive";

export function DriveFileTab({
  value,
  value$,
  onChange,
}: ControlProps<any, {}>) {
  const drive = useDrive();
  if (!drive) return null;
  return (
    <div className="el-h-full el-w-full el-p-2">
      <FileExplorer
        drive={drive}
        onFileClicked={(file) => {
          const fallback = isReference(value) ? value.fallback : value;
          const ref: Reference = {
            __reference: {
              type: "drive-file",
              id: file.id,
            } as any,
            fallback,
          };
          onChange?.(ref);
        }}
      />
    </div>
  );
}
