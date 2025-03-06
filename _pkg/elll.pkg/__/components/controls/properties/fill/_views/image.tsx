export function ImageControl({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (color: string) => void;
}) {
  return <div className="el-space-y-2">Image Picker</div>;
}
