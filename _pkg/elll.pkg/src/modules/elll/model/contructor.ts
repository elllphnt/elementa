import { IElll } from "~/src/types/elll";
import { Model } from "./model";

export type ModelConstructor = {
  name: string;
  new: ({ elll, url }: { elll: IElll; url: string }) => Model;
};
