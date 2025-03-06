import { RawSpinnerControl, RawSpinnerControlProps } from "./raw_spinner";

export function StatelessSpinnerControl(props: RawSpinnerControlProps) {
  return (
    <div className="el-h-7 el-px-2 el-border el-rounded-md el-w-full">
      <RawSpinnerControl {...props} />
    </div>
  );
}
