import tinycolor from "tinycolor2";

export function ColorIcon({ color }: { color?: any }) {
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
