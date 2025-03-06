import cx from "classnames";
import ProgressBar from "../loaders/progress_bar";
import { LogoMini } from "../logo/logo";

export function ElllPlaceholder({
  loading,
}: {
  loading?: boolean;
}): JSX.Element {
  return (
    <div
      className="el-h-full el-w-full el-flex el-flex-col el-justify-center el-items-center el-text-fg-300"
      style={{
        pointerEvents: "auto",
      }}
    >
      <LogoMini className="el-h-8" />
      <div
        className={cx("el-w-8 el-mt-4", {
          "el-opacity-0": !loading,
        })}
      >
        <ProgressBar />
      </div>
    </div>
  );
}
