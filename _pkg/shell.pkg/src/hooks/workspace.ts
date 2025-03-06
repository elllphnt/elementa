import { useContext } from "react";
import WorkspaceContext from "../contexts/workspace";

export const useWorkspace = () => {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) {
    throw new Error("WorkspaceContext not found");
  }
  return workspace;
};
