import { z } from "zod";
import type { CrdtAtomic} from "../_shared/_.js";
import { crdtAtomicSchema } from "../_shared/_.js";

export type PackageData = {
  name: string;
  version: string;
  registry: string;
};

export type PackageSheetData = CrdtAtomic<["packages[*]"]> & {
  packages: PackageData[];
};

export const packageDataSchema = z.object({
  name: z.string(),
  version: z.string(),
  registry: z.string(),
});

export const packageSheetSchema = crdtAtomicSchema(["packages[*]"]).extend({
  packages: z.array(packageDataSchema).default([]),
});
