import { z } from "zod";
import {
  importReferenceSchema,
  type ImportReference,
} from "../_primitives/_.js";

export type AppData = {
  routerRef?: ImportReference;
};

export const appSchema = z.object({
  router: importReferenceSchema.optional(),
});
