import { Subject } from "rxjs";

export class SSEClient<E> {
  private eventSource: EventSource | null = null;
  private serverUrl: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 1000; // Start with 1 second
  private maxReconnectInterval: number = 30000; // Max 30 seconds
  private isConnected: boolean = false;

  private _events$ = new Subject<E>();

  event$ = this._events$.asObservable();

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
        console.log("SSE message received:", event.data);
        this._events$.next(JSON.parse(event.data) as E);
      };

      this.eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        this.isConnected = false;
        this.handleReconnect();
      };

      this.eventSource.addEventListener("connected", (event) => {
        const data = JSON.parse(event.data);
        console.log("SSE connected:", data);
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
