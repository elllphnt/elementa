import { createDriveServiceClient, File } from "@elllphnt/drive-service-client";
import chalk from "chalk";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname } from "path";
import { pipeline } from "stream/promises";
import { baseUrl, tokenManager } from "./_common.js";

export const driveServiceClient = createDriveServiceClient({
  baseUrl,
  tokenManager,
});

export async function getDriveFile(file_id: string): Promise<File | undefined> {
  const result = await driveServiceClient.get("/drive-files/{file_id}", {
    params: {
      path: {
        file_id,
      },
    },
  });

  if (result.response.status === 404) {
    return undefined;
  } else if (!result.response.ok) {
    console.error(
      chalk.red(`Failed to get file ${file_id}: ${result.response.statusText}`),
    );
    throw result.response;
  }

  return result.data as File;
}

export async function downloadDriveFile(
  file_id: string,
  path: string,
): Promise<void> {
  const signedUrlResult = await driveServiceClient.get(
    "/drive-files/{file_id}/signed-url",
    {
      params: {
        path: {
          file_id,
        },
        query: {
          action: "read",
        },
      },
    },
  );
  if (!signedUrlResult.response.ok) {
    console.error(
      chalk.red(
        `Failed to get signed URL for file ${file_id}: ${signedUrlResult.response.statusText}`,
      ),
    );
    throw signedUrlResult.response;
  }
  const signedUrl = signedUrlResult.data!.url;
  await download(signedUrl, path);
}

export async function download(url: string, path: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download from ${url}: ${response.statusText}`);
  }

  // Ensure the parent directory exists
  await mkdir(dirname(path), { recursive: true });

  await pipeline(response.body as any, createWriteStream(path));
}
