export function NoDriveView({
  onAddDrive,
}: {
  onAddDrive: () => void;
}): JSX.Element {
  return (
    <div
      className="el-text-fg el-space-y-4 el-p-4"
      style={{ textAlign: "center" }}
    >
      <p>This tenant doesn't have any drive yet.</p>
      <p>
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddDrive();
          }}
          className="el-text-blue"
        >
          Add drive
        </button>
      </p>
    </div>
  );
}
