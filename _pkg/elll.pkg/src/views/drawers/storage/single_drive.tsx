import { Drive } from "@repo/backend";
import { ScrollArea } from "@repo/components";
import { DriveTreeEntries } from "./drive_tree";

export function SingleDriveView({ drive }: { drive: Drive }): JSX.Element {
  return (
    <ScrollArea
      scrollY
      containerClassName="el-p-2 el-pt-1 el-gap-2 el-flex el-flex-col"
    >
      <DriveTreeEntries drive={drive} />
    </ScrollArea>
  );
}
