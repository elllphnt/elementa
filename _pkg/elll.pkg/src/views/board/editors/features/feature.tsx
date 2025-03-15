import { ProgressBar } from "@repo/components";
import { useObservable } from "@repo/utils";

export function FeatureCard({ feature }: { feature: any }): JSX.Element {
  const data = useObservable(feature.data$, feature.data);
  const planning = useObservable(feature.planning$, feature.planning);
  return (
    <div className="el-relative el-p-2 el-rounded el-bg-bg-100 el-border hover:el-bg-bg-200/50 el-space-y-1">
      <p className="el-font-semibold">{data.name}</p>
      <p className="el-text-fg-400">{data.description}</p>
      {planning ? (
        <div
          className="el-text-pm"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <ProgressBar />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
