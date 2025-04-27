import { StyleFragmentData } from "./fragments/fragment.js";
import { StyleData } from "./style/_.js";

export type StyleSheetData = {
  styles?: Record<string, StyleData>;
  fragments?: StyleFragmentData[];
  conditions?: Record<string, string>;
};
