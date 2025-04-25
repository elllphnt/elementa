import { createContext } from "react";

export const ComponentStackContext = createContext<Set<string>>(new Set());
