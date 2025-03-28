import { BehaviorSubject } from "rxjs";
import { IElll } from "~/src/types/elll";

export type AiGenerationStatus = "idle" | "running" | "complete" | "error";

export class AiGeneration {
  readonly elll: IElll;
  readonly query: string;
  private path: string;

  private _title$ = new BehaviorSubject<string>("");
  private _status$ = new BehaviorSubject<AiGenerationStatus>("idle");

  get title() {
    return this._title$.value;
  }
  get title$() {
    return this._title$.asObservable();
  }

  get status() {
    return this._status$.value;
  }
  get status$() {
    return this._status$.asObservable();
  }

  constructor({
    elll,
    query,
    path,
  }: {
    elll: IElll;
    query: string;
    path: string;
  }) {
    this.elll = elll;
    this.query = query;
    this.path = path;
  }

  setTitle(title: string) {
    this._title$.next(title);
  }
  async run() {
    const workspace_id = this.elll.repository?.workspaceId;
    if (!workspace_id) {
      console.error("No workspace ID found.");
      return;
    }

    this._status$.next("running");

    try {
      const response = await fetch("http://localhost:32989/copilot/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          workspace_id,
          query: this.query,
          path: this.path,
        }),
      });

      if (!response.body) {
        throw new Error(
          "ReadableStream not supported or response body is empty.",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunkStr = decoder.decode(value);
          try {
            const parts = chunkStr
              .split("\n")
              .map((part) => part.trim())
              .filter(Boolean);
            const parsedChunks = parts.map((part) => JSON.parse(part));
            parsedChunks.forEach((parsedChunk) =>
              this.handleStreamEvent(parsedChunk),
            );
          } catch (error) {
            console.error("Error parsing chunk:", error, "Chunk:", chunkStr);
          }
        }
      }

      this._status$.next("complete");
    } catch (error) {
      console.error("Error running generation:", error);
      this._status$.next("error");
    }
  }

  private handleStreamEvent(event: any) {
    if (event.type === "generation") {
      this._title$.next(event.title);
    } else if (event.type === "status") {
      this._status$.next(event.status);
    }
  }
}
