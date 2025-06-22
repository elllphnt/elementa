import { z } from "zod";

export type AppData = {
  routerUrl?: string;
};

export const appSchema = z.object({
  routerUrl: z.string().optional(),
});
