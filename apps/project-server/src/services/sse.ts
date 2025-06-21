import { Request, Response } from "express";

export interface SSEConnection {
  id: string;
  response: Response;
  projectId?: string;
  lastEventId?: string;
}

export class SSEService {
  private connections: Map<string, SSEConnection> = new Map();
  private eventIdCounter: number = 0;

  handleConnection(req: Request, res: Response): void {
    const connectionId = this.generateConnectionId();
    const lastEventId = req.headers["last-event-id"] as string;

    // Set SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Send initial connection event
    this.sendEvent(res, {
      id: this.getNextEventId(),
      event: "connected",
      data: JSON.stringify({
        connectionId,
        timestamp: new Date().toISOString(),
      }),
    });

    // Store connection
    const connection: SSEConnection = {
      id: connectionId,
      response: res,
      lastEventId,
    };
    this.connections.set(connectionId, connection);

    // Handle client disconnect
    req.on("close", () => {
      console.log(`SSE connection closed: ${connectionId}`);
      this.connections.delete(connectionId);
    });

    req.on("error", (error) => {
      console.error(`SSE connection error: ${connectionId}`, error);
      this.connections.delete(connectionId);
    });

    console.log(`New SSE connection: ${connectionId}`);
  }

  broadcastEvent(eventType: string, data: any): void {
    const sseEvent = {
      id: this.getNextEventId(),
      event: eventType,
      data: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }),
    };

    for (const connection of this.connections.values()) {
      this.sendEvent(connection.response, sseEvent);
    }
  }

  closeAllConnections(): void {
    for (const connection of this.connections.values()) {
      try {
        connection.response.end();
      } catch (error) {
        console.error(`Error closing connection ${connection.id}:`, error);
      }
    }
    this.connections.clear();
  }

  private sendEvent(
    res: Response,
    event: { id: string; event: string; data: string }
  ): void {
    res.write(`id: ${event.id}\n`);
    res.write(`event: ${event.event}\n`);
    res.write(`data: ${event.data}\n\n`);
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextEventId(): string {
    return (++this.eventIdCounter).toString();
  }
}
