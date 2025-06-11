import { z } from "zod";

// Types
export type CrdtAtomic<T extends [...string[]]> = {
  __crdtAtomic: T;
};

// Schemas

export const crdtAtomicSchema = (fields: [string, ...string[]]) =>
  z.object({
    __crdtAtomic: z
      .array(z.enum(fields))
      .length(fields.length)
      .refine(
        (arr) => {
          const unique = new Set(arr);
          return (
            unique.size === fields.length &&
            fields.every((val) => unique.has(val))
          );
        },
        {
          message: `Array must contain exactly ${fields.join(
            ","
          )} in any order with no duplicates`,
        }
      )
      .default(fields),
  });
