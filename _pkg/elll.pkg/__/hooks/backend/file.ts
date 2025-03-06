import { useObservable } from "@repo/utils";
import { useWorkspace } from "./workspace";

export function useWorkspaceFileAtPath(
  path: string,
  create?: {
    type: string;
  },
) {
  const workspace = useWorkspace();
  const fileAtPathQuery = workspace?.fileAtPath(path, {
    autoFetch: true,
    create,
  });
  const file = useObservable(fileAtPathQuery?.data$, fileAtPathQuery?.data);
  return [file, fileAtPathQuery] as const;
}
