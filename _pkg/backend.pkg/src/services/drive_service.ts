import { driveServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { Drive } from "../resources/drive";
import { DriveFile } from "../resources/drive_file";

export class DriveService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get driveStore() {
    return this.backend.store(Drive);
  }
  get driveFileStore() {
    return this.backend.store(DriveFile);
  }

  get driveServiceClient() {
    return this.backend.client(driveServiceClientFactory);
  }

  private _clearFileData(id: string) {
    const fileStore = this.driveFileStore;

    const file = fileStore.instance(id);

    fileStore.remove(id);
    if (file?.isDirectory) {
      const path = file.path;
      if (path !== undefined) {
        // clear all files in directory
        const files = fileStore.instances.filter(
          (f) => f.driveId === file.driveId && file.isAncestorOf(f),
        );

        files.forEach((file) => {
          fileStore.remove(file.id);
        });
      }
    }
  }

  // Drive

  async createDrive({ name, tenant_id }: { name: string; tenant_id: string }) {
    const result = await this.driveServiceClient.post("/drives", {
      body: {
        tenant_id,
        name,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.driveStore.push(result.data);
    }
  }
  async fetchDrive(drive_id: string) {
    const result = await this.driveServiceClient.get("/drives/{drive_id}", {
      params: {
        path: {
          drive_id,
        },
      },
    });

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.driveStore.push(result.data);
    } else {
      this.driveStore.instance(drive_id)?.setNotFound();
    }
  }
  async fetchDrives({ tenant_id }: { tenant_id: string }) {
    const result = await this.driveServiceClient.get("/drives", {
      params: {
        query: {
          tenant_id,
        },
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    result.data!.map((data) => this.driveStore.push(data));
  }
  async updateDrive(
    drive_id: string,
    update: {
      name?: string;
    },
  ) {
    const result = await this.driveServiceClient.patch("/drives/{drive_id}", {
      params: {
        path: {
          drive_id,
        },
      },
      body: {
        name: update.name,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.driveStore.push(result.data);
    }
  }
  async deleteDrive(drive_id: string) {
    const result = await this.driveServiceClient.delete("/drives/{drive_id}", {
      params: {
        path: {
          drive_id,
        },
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    return this.driveStore.remove(drive_id);
  }
  async fetchDriveFileAtPath({
    drive_id,
    path,
    create,
  }: {
    drive_id: string;
    path: string;
    create?: {
      type: string;
    };
  }) {
    const result = await this.driveServiceClient.get(
      "/drives/{drive_id}/file",
      {
        params: {
          path: {
            drive_id,
          },
          query: {
            path,
          },
        },
      },
    );

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.driveFileStore.push(result.data);
    } else if (create) {
      return this.createDriveFile({
        drive_id,
        path,
        type: create.type,
      });
    }
  }

  // Drive File

  async createDriveFile({
    drive_id,
    path,
    type,
  }: {
    drive_id: string;
    path: string;
    type: string;
  }) {
    const result = await this.driveServiceClient.post("/drive-files", {
      body: {
        drive_id,
        path,
        type,
      },
    });

    if (!result.response.ok) {
      throw result.error;
    }

    return this.driveFileStore.push(result.data!);
  }
  async fetchDriveFile(file_id: string) {
    const result = await this.driveServiceClient.get("/drive-files/{file_id}", {
      params: {
        path: {
          file_id,
        },
      },
    });

    if (!result.response.ok && result.response.status !== 404) {
      throw result.error;
    }

    if (result.data) {
      this.driveFileStore.push(result.data);
    }
  }
  async fetchDriveFiles({
    drive_id,
    include,
    exclude,
    types,
    path,
    depth,
  }: {
    drive_id: string;
    include?: string[];
    exclude?: string[];
    types?: string[];
    path?: string;
    depth?: number;
  }) {
    const limit = 100;
    let cursor: string | undefined = undefined;
    let hasMore = true;
    const files: DriveFile[] = [];

    while (hasMore) {
      const result = await this.driveServiceClient.get(
        "/drives/{drive_id}/files",
        {
          params: {
            path: {
              drive_id,
            },
            query: {
              path,
              limit,
              cursor,
              depth,
              include: include?.join(","),
              exclude: exclude?.join(","),
              types: types?.join(","),
            } as any,
          },
        },
      );

      if (!result.response.ok) {
        console.error(
          `Failed to list drive files: ${result.response.statusText}`,
          result.error,
        );
        throw result.response;
      }

      const newFiles: DriveFile[] = result.data!.map((data) =>
        this.driveFileStore.push(data),
      );
      files.push(...newFiles);

      if (newFiles.length < limit) {
        hasMore = false;
      } else {
        cursor = newFiles[newFiles.length - 1].id;
      }
    }

    return files;
  }
  async updateDriveFile(
    file_id: string,
    update: {
      path?: string;
      type?: string;
    },
  ) {
    const result = await this.driveServiceClient.patch(
      "/drive-files/{file_id}",
      {
        params: {
          path: {
            file_id,
          },
        },
        body: {
          path: update.path,
          type: update.type,
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    if (result.data) {
      return this.driveFileStore.push(result.data);
    }
  }
  async deleteDriveFile(file_id: string) {
    const result = await this.driveServiceClient.delete(
      "/drive-files/{file_id}",
      {
        params: {
          path: {
            file_id,
          },
        },
      },
    );

    if (!result.response.ok) {
      throw result.error;
    }

    return this._clearFileData(file_id);
  }

  async getSignedFileUrl(file_id: string, action: "read" | "write") {
    const result = await this.driveServiceClient.get(
      "/drive-files/{file_id}/signed-url",
      {
        params: {
          path: { file_id },
          query: { action },
        },
      },
    );
    if (!result.response.ok) {
      throw result.error;
    }
    return result.data!;
  }

  async uploadFiles({
    drive_id,
    files,
    path,
  }: {
    drive_id: string;
    files: File[] | FileList;
    path: string;
  }) {
    const uploadResults = [];
    const fileList = Array.from(files);
    const fileStore = this.driveFileStore;

    for (const file of fileList) {
      let filePath = `${path}/${file.name}`;
      let counter = 1;
      // Ensure file path is unique
      while (
        fileStore.instances.some(
          (f) => f.path === filePath && f.driveId === drive_id,
        )
      ) {
        const extIndex = file.name.lastIndexOf(".");
        if (extIndex !== -1) {
          const nameWithoutExt = file.name.substring(0, extIndex);
          const extension = file.name.substring(extIndex);
          filePath = `${path}/${nameWithoutExt} (${counter})${extension}`;
        } else {
          filePath = `${path}/${file.name} (${counter})`;
        }
        counter++;
      }

      // Create file metadata with the available path
      const driveFile = await this.createDriveFile({
        drive_id,
        path: filePath,
        type: file.type,
      });

      // Get write signed file URL
      const signedUrl = await this.getSignedFileUrl(driveFile.id, "write");

      // Upload file using fetch API
      const response = await fetch(signedUrl.url, {
        method: "PUT",
        body: file,
        headers: {
          "content-type": signedUrl.type,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to upload file: ${file.name}`);
      }
      uploadResults.push(driveFile);
    }

    return uploadResults;
  }
}

export const driveServiceFactory = createConstructorFactory(DriveService, {
  name: "drive-service",
});
