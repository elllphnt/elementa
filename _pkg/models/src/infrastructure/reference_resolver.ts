import { StaticReference } from "@elllphnt/elementa-base";

export interface ReferenceResolver {
  resolve(ref: StaticReference): Promise<any>;
}
