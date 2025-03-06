import { ContextMenuOption } from "./_types";
import { ContextMenuOptionView } from "./context_menu_option";

export function ContextMenuGroupView({
  group,
}: {
  group: ContextMenuOption[];
}) {
  return (
    <div
      className="el-py-2 el-px-2"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {group.map((item, index) => (
        <ContextMenuOptionView key={index} option={item} />
      ))}
    </div>
  );
}
