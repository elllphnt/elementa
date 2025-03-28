import { ProgressBar } from "@repo/components";
import { NotificationContext, useNotificationTitle } from "@repo/shell";
import { useObservable } from "@repo/utils";
import { useContext, useEffect } from "react";
import { AiGeneration } from "~/src/modules/elll/copilot/generation";

export function GenerationNotification({
  generation,
}: {
  generation: AiGeneration;
}) {
  const context = useContext(NotificationContext);
  const title = useObservable(generation.title$, generation.title);
  const status = useObservable(generation.status$, generation.status);

  useNotificationTitle(title || "Generation");

  useEffect(() => {
    if (status === "complete" || status === "error") {
      setTimeout(() => {
        context?.close();
      }, 5000);
    }
  }, [status]);

  let message = `Generating ${title} with status ${status}...`;

  switch (status) {
    case "idle":
      message = "Preparing...";
      break;
    case "running":
      message = `Generating ${title}...`;
      break;
    case "error":
      message = `Generation failed.`;
      break;
    case "complete":
      message = `Generation complete.`;
      break;
  }

  return (
    <div className="el-relative el-p-3">
      {status === "idle" || status === "running" ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <ProgressBar height={1} />
        </div>
      ) : (
        <></>
      )}

      {message}
    </div>
  );
}
