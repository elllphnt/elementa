import { FileSystem, Infrastructure } from "@repo/elementa-models";
import { IElll } from "~/src/types/elll";
import { IElllElementaInfrastructure } from "./_types";
import { ElllElementaFileSystem } from "./file_system";

export class ElllElementaInfrastructure
  extends Infrastructure
  implements IElllElementaInfrastructure
{
  readonly elll: IElll;
  readonly fileSystem: FileSystem;

  constructor({ elll }: { elll: IElll }) {
    super();
    this.elll = elll;
    this.fileSystem = new ElllElementaFileSystem({ infrastructure: this });
  }
}
