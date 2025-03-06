import { createContext } from "react";
import { Router } from "../router/router";

export const RouterContext = createContext<Router>(new Router());
