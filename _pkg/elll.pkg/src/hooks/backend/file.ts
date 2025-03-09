import { useObservable } from "@repo/utils";
import { useDrive } from "./drive";
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

export function useDriveFileAtPath(
  path: string,
  create?: {
    type: string;
  },
) {
  const drive = useDrive();
  const fileAtPathQuery = drive?.fileAtPath(path, {
    autoFetch: true,
    create,
  });
  const file = useObservable(fileAtPathQuery?.data$, fileAtPathQuery?.data);
  return [file, fileAtPathQuery] as const;
}
