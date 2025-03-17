import { ScrollArea, TreeEntry } from "@repo/components";
import { ColorIcon } from "~/src/components/ui/controls/_uncertain/fill/color_icon";

const colors = [
  // name, r,g,b,a
  ["blue-100", 173, 216, 230, 1],
  ["blue-200", 135, 206, 235, 1],
  ["blue-300", 70, 130, 180, 1],
  ["blue-400", 0, 0, 255, 1],
  ["blue-500", 0, 0, 139, 1],
  ["green-100", 144, 238, 144, 1],
  ["green-200", 0, 255, 0, 1],
  ["green-300", 0, 128, 0, 1],
  ["green-400", 34, 139, 34, 1],
  ["green-500", 0, 100, 0, 1],
  ["red-100", 255, 182, 193, 1],
  ["red-200", 255, 99, 71, 1],
  ["red-300", 255, 0, 0, 1],
  ["red-400", 139, 0, 0, 1],
  ["red-500", 128, 0, 0, 1],
  ["yellow-100", 255, 255, 224, 1],
  ["yellow-200", 255, 255, 0, 1],
  ["yellow-300", 255, 215, 0, 1],
  ["yellow-400", 255, 165, 0, 1],
  ["yellow-500", 255, 140, 0, 1],
  ["purple-100", 230, 230, 250, 1],
  ["purple-200", 216, 191, 216, 1],
  ["purple-300", 221, 160, 221, 1],
  ["purple-400", 238, 130, 238, 1],
  ["purple-500", 128, 0, 128, 1],
] as const;

export function VariableControlMenu() {
  return (
    <div
      style={{
        height: 400,
        width: 240,
      }}
      className="el-space-y-2 el-flex el-flex-col"
    >
      <div>
        <input
          className="el-h-7 el-border el-rounded el-w-full el-px-2"
          placeholder="Variable name"
        />
      </div>
      <div className="el-grow el-overflow-hidden">
        <ScrollArea scrollY containerClassName="el-space-y-1">
          {colors.map(([name, r, g, b, a]) => (
            <TreeEntry
              key={name}
              title={name}
              icon={<ColorIcon color={{ r, g, b, a }} />}
            >
              {name}
            </TreeEntry>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
}
