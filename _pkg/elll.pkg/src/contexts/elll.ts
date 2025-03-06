import { createContext } from "react";
import { IElll } from "../types/elll";

export const ElllContext = createContext<IElll | undefined>(undefined);
