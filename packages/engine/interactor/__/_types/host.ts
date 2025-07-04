import type { DropOptions, Handle } from "./_.js";

export interface IHost {
  acceptDrop(
    handle: Handle,
    {
      datatypes,
    }: {
      datatypes: string[];
    }
  ): boolean;
  handleDrop(
    handle: Handle,
    data: Record<string, any>,
    options?: DropOptions
  ): Handle[];
}
