import { ColorData } from "@elllphnt/elll-element";
import tinycolor from "tinycolor2";

export function ColorIcon({ color }: { color?: ColorData }) {
  return (
    <div
      className="el-w-4 el-h-4 el-rounded"
      style={{
        backgroundColor: color
          ? tinycolor(color).toHex8String()
          : "transparent",
      }}
    />
  );
}
