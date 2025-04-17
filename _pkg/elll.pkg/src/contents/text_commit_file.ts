import { makeElllUrl } from "@elllphnt/utils";
import { CommitFile } from "@repo/backend";
import { map } from "rxjs";
import { IElll } from "~/src/types/elll";
import { Content } from "../modules/elll/content/content";

export class TextCommitFileContent extends Content {
  static key = 0;
  key = TextCommitFileContent.key++;

  file: CommitFile;
  elll: IElll;

  get url(): string {
    return makeElllUrl(this.file.id);
  }

  get name() {
    return this.file.name;
  }
  get name$() {
    return this.file.name$;
  }

  get data() {
    return this.file.content;
  }
  get data$() {
    return this.file.content$;
  }

  get loaded() {
    return this.data !== undefined;
  }
  get loaded$() {
    return this.data$.pipe(map((content) => content !== undefined));
  }

  get loading() {
    return !this.loaded;
  }
  get loading$() {
    return this.loaded$.pipe(map((loaded) => !loaded));
  }

  constructor({ fileId, elll }: { fileId: string; elll: IElll }) {
    super();
    this.elll = elll;
    this.file = elll.backend.instance(fileId, true) as CommitFile;

    // auto load the content
    if (this.file.content === undefined && !this.file.fetchingContent) {
      this.file.fetchContent();
    }
  }

  update(data: any): void {
    console.warn("Cannot update text commit file content");
  }
  setName(name: string): void {
    console.warn("Cannot rename text commit file content");
  }
  async delete(): Promise<void> {
    console.warn("Cannot delete text commit file content");
  }
}
