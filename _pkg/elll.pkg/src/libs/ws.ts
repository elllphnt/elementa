type EventListener = (event: Event | MessageEvent<any>) => void;

interface ReconnectingWebSocketOptions {
  getToken?: () => Promise<string>; // Authorization token
  reconnectInterval?: number; // Retry interval in ms
  maxReconnectAttempts?: number; // Maximum reconnect attempts
}

export class ReconnectingWebSocket {
  url: string;
  private getToken?: () => Promise<string>;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private currentReconnectAttempts: number;
  private listeners: Record<
    "open" | "message" | "close" | "error",
    EventListener[]
  >;
  private socket: WebSocket | null;

  constructor(url: string, options: ReconnectingWebSocketOptions = {}) {
    this.url = url;
    this.getToken = options.getToken;
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || Infinity;
    this.currentReconnectAttempts = 0;

    this.listeners = { open: [], message: [], close: [], error: [] };
    this.socket = null;
  }

  async connect(): Promise<void> {
    // Pass the token as subprotocol
    this.socket = new WebSocket(
      this.url,
      this.getToken ? [await this.getToken()] : undefined,
    );

    // Bind WebSocket events
    this.socket.onopen = (event) => this.handleOpen(event);
    this.socket.onmessage = (event) => this.handleMessage(event);
    this.socket.onclose = (event) => this.handleClose(event);
    this.socket.onerror = (event) => this.handleError(event);
  }

  protected handleOpen(event: Event): void {
    console.log("WebSocket connected");
    this.currentReconnectAttempts = 0; // Reset reconnect attempts
    this.emit("open", event);
  }

  protected handleMessage(event: MessageEvent<any>): void {
    this.emit("message", event);
  }

  protected handleClose(event: CloseEvent): void {
    console.log("WebSocket closed:", event.reason);

    if (
      !event.wasClean &&
      this.currentReconnectAttempts < this.maxReconnectAttempts
    ) {
      this.currentReconnectAttempts++;
      console.log(
        `Reconnecting in ${this.reconnectInterval / 1000} seconds...`,
      );
      setTimeout(() => this.connect(), this.reconnectInterval);
    }

    this.emit("close", event);
  }

  protected handleError(event: Event): void {
    console.error("WebSocket error:", event);
    this.emit("error", event);
  }

  protected emit(
    eventType: "open" | "message" | "close" | "error",
    event: Event | MessageEvent<any>,
  ): void {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach((callback) => callback(event));
    }
  }

  public on(eventType: "open", callback: (event: Event) => void): void;
  public on(
    eventType: "message",
    callback: (event: MessageEvent<any>) => void,
  ): void;
  public on(eventType: "close", callback: (event: CloseEvent) => void): void;
  public on(eventType: "error", callback: (event: Event) => void): void;
  public on(
    eventType: "open" | "message" | "close" | "error",
    callback: any,
  ): void {
    if (this.listeners[eventType]) {
      this.listeners[eventType].push(callback);
    } else {
      console.error(`Unsupported event type: ${eventType}`);
    }
  }

  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    } else {
      console.error("WebSocket is not open. Message not sent.");
    }
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
