export function StyleSystemModal() {
  return (
    <div
      className="el-p-3 el-rounded el-space-y-3"
      style={{
        width: 540,
        height: 480,
      }}
    >
      <p>Style System</p>
      <div className="el-space-y-1">
        <p className="el-text-fg-400">
          Set up global settings for your design system.
        </p>

        <p>Breakpoints</p>
        <p>Colors</p>
        <p>Lengths</p>
      </div>
    </div>
  );
}
