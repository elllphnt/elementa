import { createContext } from "react";
import { Shell } from "~/src/models/shell";

const ShellContext = createContext<Shell | null>(null);
export default ShellContext;
