import React from "react";
import { ViewStore } from "./view_store";

const defaultViewStore = new ViewStore();
export const ViewStoreContext =
  React.createContext<ViewStore>(defaultViewStore);
