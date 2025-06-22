import { Namespace } from "@elllphnt/elementa-runtime";
import { createContext } from "react";

export const NamespaceContext = createContext<Namespace>(new Namespace());
