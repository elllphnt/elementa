import { Observable } from "rxjs";
import { Project } from "../project/project";

export abstract class FileSystem {
  abstract fileContent(url: string): string | undefined;
  abstract fileContent$(url: string): Observable<string | undefined>;

  abstract fileName(url: string): string | undefined;
  abstract fileName$(url: string): Observable<string | undefined>;

  abstract getAbsoluteFileUrl(base: string, url: string): string;
  abstract getStandardFileUrl(url: string): string;
  abstract getFileProject(url: string): Project | undefined;

  abstract resolveContentUrl(url: string): Promise<{
    url: string;
    expiresAt?: number;
  }>;
}
