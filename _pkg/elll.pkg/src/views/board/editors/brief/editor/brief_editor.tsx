import { ScrollArea } from "@repo/components";

export function BriefEditor({
  onAddFeature,
  addingFeature,
}: {
  addingFeature?: boolean;
  onAddFeature?: () => void;
}) {
  return <ScrollArea scrollY containerClassName="el-p-3"></ScrollArea>;
}
