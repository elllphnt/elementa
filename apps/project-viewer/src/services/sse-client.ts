import { Subject } from "rxjs";

export interface SSEEvent {
  id: string;
  event: string;
  data: unknown;
  timestamp: string;
}

export interface FileChangeEvent {
  type: "change";
  path: string;
  projectId?: string;
  timestamp: string;
  stats?: {
    size: number;
    mtime: string;
    isFile: boolean;
    isDirectory: boolean;
  };
}

export type SSEEventHandler = (event: SSEEvent) => void;
export type FileChangeHandler = (event: FileChangeEvent) => void;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export type FileUpdateEvent = {
  action: "add" | "change" | "remove";
  projectId: string;
  id: string;
};

export class SSEClient {
  private eventSource: EventSource | null = null;
  private serverUrl: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 1000; // Start with 1 second
  private maxReconnectInterval: number = 30000; // Max 30 seconds
  private isConnected: boolean = false;
  private eventHandlers: Map<string, Set<SSEEventHandler>> = new Map();

  private _fileEvent$ = new Subject<FileUpdateEvent>();

  fileEvent$ = this._fileEvent$.asObservable();

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      this.eventSource = new EventSource(`${this.serverUrl}/sse/events`);

      this.eventSource.onopen = () => {
        console.log("SSE connection opened");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectInterval = 1000; // Reset reconnect interval
      };

      this.eventSource.onmessage = (event) => {
        console.log("SSE message received:", event);
        this.handleMessage(event);
      };

      this.eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        this.isConnected = false;
        this.handleReconnect();
      };

      // Listen for specific event types
      this.eventSource.addEventListener("connected", (event) => {
        const data = JSON.parse(event.data);
        console.log("SSE connected:", data);
        this.triggerEventHandlers("connected", {
          id: event.lastEventId || "",
          event: "connected",
          data,
          timestamp: data.timestamp,
        });
      });

      this.eventSource.addEventListener("file", (event) => {
        this._fileEvent$.next(JSON.parse(event.data) as FileUpdateEvent);
      });
    } catch (error) {
      console.error("Failed to create SSE connection:", error);
      this.handleReconnect();
    }
  }
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }

  isSSEConnected(): boolean {
    return (
      this.isConnected && this.eventSource?.readyState === EventSource.OPEN
    );
  }
  getConnectionState(): {
    connected: boolean;
    readyState?: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected,
      readyState: this.eventSource?.readyState,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.triggerEventHandlers("message", {
        id: event.lastEventId || "",
        event: "message",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to parse SSE message:", error);
    }
  }
  private triggerEventHandlers(eventType: string, event: SSEEvent): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in ${eventType} handler:`, error);
        }
      });
    }
  }
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectInterval}ms`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);

    // Exponential backoff with max limit
    this.reconnectInterval = Math.min(
      this.reconnectInterval * 2,
      this.maxReconnectInterval
    );
  }
}

export const sseClient = new SSEClient(SERVER_URL);
sseClient.connect();
