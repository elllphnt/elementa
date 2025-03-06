import { TokenManager } from "@elllphnt/elll-client";
import { docs, messages, notifications } from "@elllphnt/elll-room-protocol";
import { decodeMessage, encodeMessage } from "@elllphnt/elll-ws-protocol";
import { Disposable } from "@repo/utils";
import { BehaviorSubject, map } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import * as y from "yjs";
import { ReconnectingWebSocket } from "~/src/libs/ws";

export class Room extends Disposable {
  readonly id = uuidv4();
  readonly ws: ReconnectingWebSocket;
  readonly workspaceId: string;
  readonly userId: string;
  readonly tokenManager: TokenManager;

  readonly presenceDoc = new y.Doc();
  readonly docs = {
    [docs.presence]: new y.Doc(),
    [docs.file]: new y.Doc(),
  };
  private _initialized$ = new BehaviorSubject<Record<number, boolean>>({});

  initialized$(channel: number) {
    return this._initialized$.pipe(map((initialized) => initialized[channel]));
  }
  initialized(channel: number) {
    return this._initialized$.value[channel];
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

  constructor({
    url,
    workspaceId,
    userId,
    tokenManager,
  }: {
    url: string;
    workspaceId: string;
    userId: string;
    tokenManager: TokenManager;
  }) {
    super();

    this.workspaceId = workspaceId;
    this.userId = userId;
    this.tokenManager = tokenManager;
    this.ws = new ReconnectingWebSocket(url, {
      reconnectInterval: 3000,
      maxReconnectAttempts: Infinity,
    });

    this.init();

    this.addDisposer(() => {
      this.ws.close();
    });
  }

  private init(): void {
    this.ws.on("open", async () => {
      console.log("WebSocket connection established for Room");

      const client_id = this.id;
      const workspace_id = this.workspaceId;
      const user_id = this.userId;
      const access_token = await this.tokenManager.getToken();

      const initMessage = encodeMessage({
        msgType: messages.INIT.code,
        args: messages.INIT.encode({
          client_id,
          workspace_id,
          user_id,
          access_token,
        }),
      });
      this.ws.send(initMessage);
    });

    this.ws.on("message", async (event) => {
      const buffer = await event.data.arrayBuffer();
      const { msgType, args } = decodeMessage(buffer);

      switch (msgType) {
        case messages.NOTIFY.code: {
          const [code, message, details] = messages.NOTIFY.decode(
            ...(args as Parameters<typeof messages.NOTIFY.decode>),
          );
          this.handleNotification(code, message, details);
          break;
        }
        case messages.DOC_UPDATE.code: {
          const [channel, update] = messages.DOC_UPDATE.decode(
            ...(args as Parameters<typeof messages.DOC_UPDATE.decode>),
          );
          const ydoc = this.docs[channel];
          if (ydoc) {
            y.applyUpdate(ydoc, new Uint8Array(update));
            if (ydoc.store.pendingDs?.length) {
              console.log("Not in sync.", ydoc);
              this.initiateSynchronization(channel, ydoc);
            } else if (!this.initialized(channel)) {
              this.setInitialized(channel, true);
              console.log("Initialized", channel);
            }
          }
          console.log("DOC_UPDATE", ydoc, channel, this.docs);
          break;
        }
        case messages.DOC_STATE.code: {
          const [channel, state] = messages.DOC_STATE.decode(
            ...(args as Parameters<typeof messages.DOC_STATE.decode>),
          );
          console.log("DOC_STATE", [channel, state]);
          const ydoc = this.docs[channel];
          if (ydoc) {
            const update = y.encodeStateAsUpdate(ydoc, new Uint8Array(state));
            this.ws.send(
              encodeMessage({
                msgType: messages.DOC_UPDATE.code,
                args: messages.DOC_UPDATE.encode(channel, update),
              }),
            );
          }
          break;
        }
      }
    });

    for (const [channel, doc] of Object.entries(this.docs)) {
      doc.on("update", (update: Uint8Array) => {
        const message = encodeMessage({
          msgType: messages.DOC_UPDATE.code,
          args: messages.DOC_UPDATE.encode(parseInt(channel), update),
        });

        if (message.byteLength > 100000) {
          console.warn(
            "large message",
            update.length,
            update[0],
            update[update.length - 1],
          );
        }

        this.ws.send(message);
      });
    }

    this.ws.connect();
  }

  setInitialized(channel: number, value: boolean) {
    this._initialized$.next({
      ...this._initialized$.value,
      [channel]: value,
    });
  }

  initiateSynchronization(no: number, doc: y.Doc) {
    if (doc) {
      this.ws.send(
        encodeMessage({
          msgType: messages.DOC_STATE.code,
          args: messages.DOC_STATE.encode(no, y.encodeStateVector(doc)),
        }),
      );
    }
  }

  handleNotification(code: string, message: string, details: any) {
    switch (code) {
      case notifications.connection.initialized: {
        for (const [no, doc] of Object.entries(this.docs)) {
          this.initiateSynchronization(parseInt(no), doc);
        }
        break;
      }
    }
  }
}
