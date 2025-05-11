import { DropOptions, IHandle } from "./_";

export interface IHost {
  acceptDrop(
    handle: IHandle,
    {
      datatypes,
    }: {
      datatypes: string[];
    },
  ): boolean;
  handleDrop(
    handle: IHandle,
    data: Record<string, any>,
    options?: DropOptions,
  ): IHandle[];
}
