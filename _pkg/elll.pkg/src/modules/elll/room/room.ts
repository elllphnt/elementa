import { TokenManager } from "@elllphnt/elll-client";
import { docs, messages } from "@elllphnt/elll-room-protocol";
import { decodeMessage, encodeMessage } from "@elllphnt/elll-ws-protocol";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import * as y from "yjs";
import { ReconnectingWebSocket } from "~/src/libs/ws";

const systemDocs = [docs.presence];

export class Room extends Disposable {
  readonly id = uuidv4();
  readonly ws: ReconnectingWebSocket;
  readonly tokenManager: TokenManager;

  readonly docs: Record<number, y.Doc> = {
    [docs.presence]: new y.Doc(),
    [docs.file]: new y.Doc(),
  };

  private _initialized$ = new BehaviorSubject<Record<number, boolean>>({});

  initialized$(channel: number) {
    return this._initialized$.pipe(map((m) => m[channel] === true));
  }
  initialized(channel: number) {
    return this._initialized$.value[channel] === true;
  }

  doc(channel: number) {
    return this.initialized(channel) ? this.docs[channel] : undefined;
  }
  doc$(channel: number) {
    return this.initialized$(channel).pipe(
      map((initialized) => (initialized ? this.docs[channel] : undefined)),
    );
  }

  get fileDoc() {
    return this.doc(docs.file);
  }
  get fileDoc$() {
    return this.doc$(docs.file);
  }
  get presenceDoc() {
    return this.doc(docs.presence);
  }
  get presenceDoc$() {
    return this.doc$(docs.presence);
  }

  constructor({
    url,
    workspaceId,
    tokenManager,
  }: {
    url: string;
    workspaceId: string;
    tokenManager: TokenManager;
  }) {
    super();
    this.tokenManager = tokenManager;

    const u = new URL(url);
    u.searchParams.set("workspace_id", workspaceId);
    u.searchParams.set("client_id", this.id);

    this.ws = new ReconnectingWebSocket(u.toString(), {
      reconnectInterval: 3_000,
      maxReconnectAttempts: Infinity,
      getToken: async () => this.tokenManager.getToken(),
    });

    this.ws.on("open", () => {
      console.log("WebSocket connection opened");

      for (const [channel, doc] of Object.entries(this.docs)) {
        const state = y.encodeStateVector(doc);
        this.sendDocState(Number(channel), state);
      }
    });

    this.setupLocalBroadcasts();
    this.setupMessageHandler();

    this.addDisposer(() => this.ws.close());
    this.init();
  }

  private async init() {
    await this.ws.connect();
  }

  private setupMessageHandler() {
    this.ws.on("message", async (event) => {
      const buffer = await event.data.arrayBuffer();
      const { msgType, args } = decodeMessage(buffer);

      switch (msgType) {
        case messages.NOTIFY.code: {
          const [code, message, details] = messages.NOTIFY.decode(
            ...(args as Parameters<typeof messages.NOTIFY.decode>),
          );
          console.log("NOTIFY", code, message, details);
          break;
        }

        case messages.DOC_STATE.code: {
          const [channel, remoteState] = messages.DOC_STATE.decode(
            ...(args as Parameters<typeof messages.DOC_STATE.decode>),
          );
          const doc = this.docs[channel];
          if (!doc || this.initialized(channel)) break;

          // 1) Compute our local state vector
          const localState = y.encodeStateVector(doc);

          // 2) If vectors differ, compute & send our missing updates
          const vectorsEqual =
            localState.length === remoteState.length &&
            localState.every((b, i) => b === (remoteState as Uint8Array)[i]);

          if (!vectorsEqual) {
            const update = y.encodeStateAsUpdate(
              doc,
              new Uint8Array(remoteState),
            );
            this.sendDocUpdate(channel, update);
          }

          // 3) In all cases—handshake done
          this.setInitialized(channel, true);
          break;
        }

        case messages.DOC_UPDATE.code: {
          const [channel, rawUpdate] = messages.DOC_UPDATE.decode(
            ...(args as Parameters<typeof messages.DOC_UPDATE.decode>),
          );
          console.log("DOC_UPDATE", channel);
          const doc = this.docs[channel];
          if (!doc) break;

          y.applyUpdate(doc, new Uint8Array(rawUpdate));
          console.log("applyUpdate", doc.toJSON(), doc);

          // mark initialized on first arrive
          if (!this.initialized(channel)) {
            this.setInitialized(channel, true);
          }
          break;
        }

        default:
          console.warn("Unhandled msgType", msgType);
      }
    });
  }

  private setupLocalBroadcasts() {
    Object.entries(this.docs).forEach(([chanStr, doc]) => {
      const channel = Number(chanStr);
      if (systemDocs.includes(channel)) return;

      doc.on("update", (update: Uint8Array) => {
        this.sendDocUpdate(channel, update);
      });
    });
  }

  private sendDocUpdate(channel: number, update: Uint8Array) {
    const msg = encodeMessage({
      msgType: messages.DOC_UPDATE.code,
      args: messages.DOC_UPDATE.encode(channel, update),
    });

    try {
      this.ws.send(msg);
    } catch (e) {
      console.error("Failed to send DOC_UPDATE", e);
    }

    console.log("sendDocUpdate", channel, update.byteLength);
  }
  private sendDocState(channel: number, state: Uint8Array) {
    const msg = encodeMessage({
      msgType: messages.DOC_STATE.code,
      args: messages.DOC_STATE.encode(channel, state),
    });

    try {
      this.ws.send(msg);
    } catch (e) {
      console.error("Failed to send DOC_STATE", e);
    }

    console.log("sendDocState", channel, state.byteLength);
  }

  private setInitialized(channel: number, value: boolean) {
    this._initialized$.next({
      ...this._initialized$.value,
      [channel]: value,
    });
    console.log("setInitialized", channel, value);
  }
}
