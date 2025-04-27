import { Namespace } from "@repo/elementa";
import { createContext } from "react";

export const NamespaceContext = createContext<Namespace>(new Namespace());
