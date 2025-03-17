import { Reference } from "@elllphnt/elll-element";
import { DriveFile } from "@repo/backend";
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

  async resolveReference(ref: Reference): Promise<any> {
    switch (ref.__reference.type) {
      case "drive-file": {
        const file = this.elll.backend.instance<DriveFile>(
          (ref.__reference as any).id,
          true,
        );
        const url = await file.getSignedFileUrl("read");
        return url.url;
      }
      default: {
        throw new Error(`Unknown reference type: ${ref.__reference.type}`);
      }
    }
  }
}
