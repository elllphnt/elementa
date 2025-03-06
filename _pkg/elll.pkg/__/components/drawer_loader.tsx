import { ProgressBar } from "@repo/components";

export function DrawerLoader({ message }: { message?: string }) {
  return (
    <div className="el-h-full el-w-full el-text-sm el-flex el-flex-col el-gap-2 el-items-center el-justify-center el-text-fg">
      <div
        style={{
          width: 40,
        }}
      >
        <ProgressBar />
      </div>
      {message ? <p>{message}</p> : <></>}
    </div>
  );
}
