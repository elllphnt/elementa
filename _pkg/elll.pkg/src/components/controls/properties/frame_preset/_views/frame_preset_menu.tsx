import { elllIcons16, Icon, TreeEntry } from "@repo/components";
import { framePresets } from "./frame_presets";

export function FramePresetMenu({
  onChange,
}: {
  onChange: (value: { width?: number; height?: number }) => void;
}) {
  return (
    <div className="el-space-y-1">
      {framePresets.map((preset) => (
        <TreeEntry
          key={`${preset.name}|${preset.width}x${preset.height}`}
          onClick={() => onChange(preset)}
          actions={[
            {
              icon: <Icon name={elllIcons16.size} />,
              handler: () =>
                onChange({
                  width: preset.width,
                }),
            },
            {
              icon: <Icon name={elllIcons16.size} className="el-rotate-90" />,
              handler: () =>
                onChange({
                  height: preset.height,
                }),
            },
          ]}
        >
          <div className="el-flex el-items-center el-space-x-2 el-text-fg-500">
            <div>{preset.name}</div>
            <div className="el-text-sm el-text-fg-400">
              {preset.width} x {preset.height}
            </div>
          </div>
        </TreeEntry>
      ))}
    </div>
  );
}
