import React from "react";
import { IconStore } from "./icon_store";

const defaultIconStore = new IconStore();
export const IconStoreContext =
  React.createContext<IconStore>(defaultIconStore);
