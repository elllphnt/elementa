import { Drive } from "@repo/backend";
import { ScrollArea } from "@repo/components";
import { DriveTree } from "./drive";

export function MultiDriveView({ drives }: { drives: Drive[] }): JSX.Element {
  return (
    <ScrollArea
      scrollY
      containerClassName="el-p-2 el-pt-1 el-gap-2 el-flex el-flex-col"
    >
      {drives?.map((drive) => (
        <DriveTree
          key={drive.id}
          drive={drive}
          stateKey={["storage", "drive", drive.id]}
        />
      ))}
    </ScrollArea>
  );
}
