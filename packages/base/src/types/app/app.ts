import { z } from "zod";

export type AppData = {
  routerUrl?: string;
};

export const appDataSchema = z.object({
  name: z.string().optional(),
});
