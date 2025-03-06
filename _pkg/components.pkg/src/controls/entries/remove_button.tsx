export function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      className="el-border el-opacity-40 hover:el-opacity-100"
      style={{
        position: "absolute",
        height: 10,
        width: 10,
        borderRadius: "50%",
        left: -14,
        padding: 2,
        borderColor: "currentColor",
      }}
      onClick={onRemove}
    >
      <div
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "currentColor",
        }}
      />
    </button>
  );
}
