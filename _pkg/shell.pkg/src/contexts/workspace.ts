import { createContext } from "react";
import { Workspace } from "../models/workspace";

const WorkspaceContext = createContext<Workspace | undefined>(undefined);
export default WorkspaceContext;
