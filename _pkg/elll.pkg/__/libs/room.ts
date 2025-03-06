import { docs, messages, notifications } from "@elllphnt/elll-room-protocol";
import { decodeMessage, encodeMessage } from "@elllphnt/elll-ws-protocol";
import { Disposable } from "@repo/utils";
import { BehaviorSubject } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import * as Y from "yjs";
import { ReconnectingWebSocket } from "./hws";

class Room extends Disposable {
  readonly id = uuidv4();
  readonly ws: ReconnectingWebSocket;
  readonly workspaceId: string;
  readonly userId: string;
  readonly getToken: () => Promise<string>;

  readonly presenceDoc = new Y.Doc();
  readonly docs = {
    [docs.file]: new Y.Doc(),
  };

  private _initialized$ = new BehaviorSubject<boolean>(false);

  get initialized$() {
    return this._initialized$.asObservable();
  }
  get initialized() {
    return this._initialized$.value;
  }

  doc(channel: number) {
    return this.docs[channel] as Y.Doc | undefined;
  }

  get componentDoc() {
    return this.doc(docs.file)!;
  }

  get self() {
    return this.presenceDoc.getMap(this.id);
  }

  constructor({
    url,
    workspaceId,
    userId,
    getToken,
  }: {
    url: string;
    workspaceId: string;
    userId: string;
    getToken: () => Promise<string>;
  }) {
    super();

    this.workspaceId = workspaceId;
    this.userId = userId;
    this.getToken = getToken;
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
      const access_token = await this.getToken();

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

      console.log("Message received", msgType, args, messages);
      switch (msgType) {
        case messages.NOTIFY.code: {
          const [code, message, details] = messages.NOTIFY.decode(
            ...(args as Parameters<typeof messages.NOTIFY.decode>),
          );
          this.handleNotification(code, message, details);
          break;
        }
        case messages.DOC.code: {
          const [doc, update] = messages.DOC.decode(
            ...(args as Parameters<typeof messages.DOC.decode>),
          );
          const ydoc = this.doc(doc);
          if (ydoc) {
            Y.applyUpdate(ydoc, new Uint8Array(update));
            ydoc.isLoaded = true;
            console.log("Document updated", doc);
          }
          break;
        }
      }
    });

    for (const [channel, doc] of Object.entries(this.docs)) {
      doc.on("update", (update: Uint8Array) => {
        if (!doc.isLoaded) {
          console.log("Document not loaded yet", channel);
          return;
        }

        const message = encodeMessage({
          msgType: messages.DOC.code,
          args: messages.DOC.encode(parseInt(channel), update),
        });

        this.ws.send(message);
      });
    }
  }

  handleNotification(code: string, message: string, details: any) {
    switch (code) {
      case notifications.connection.initialized: {
        this._initialized$.next(true);
        break;
      }
    }
  }
}

export default Room;
