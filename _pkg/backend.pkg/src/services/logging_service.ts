import { loggingServiceClientFactory } from "../clients";
import { Backend } from "../lib/backend";
import { createConstructorFactory } from "../lib/factory";
import { Service } from "../lib/service";
import { logFactory } from "../resources/log";
import { logSinkFactory } from "../resources/log_sink";

export class LoggingService extends Service {
  constructor({ backend }: { backend: Backend }) {
    super({ backend });
  }

  get logSinkStore() {
    return this.backend.store(logSinkFactory);
  }
  get logStore() {
    return this.backend.store(logFactory);
  }

  get loggingServiceClient() {
    return this.backend.client(loggingServiceClientFactory);
  }

  // Domains

  async fetchSink(sinkId: string) {
    const getSinkResult = await this.loggingServiceClient.get(
      "/logging/sinks/{sinkId}",
      {
        params: {
          path: {
            sinkId,
          },
        },
      },
    );
    if (!getSinkResult.response.ok && getSinkResult.response.status !== 404) {
      throw getSinkResult.error;
    }
    return this.logSinkStore.push(sinkId, getSinkResult.data);
  }
  async fetchLogs(sinkId: string) {
    const getLogsResult = await this.loggingServiceClient.get(
      "/logging/sinks/{sinkId}/logs",
      {
        params: {
          path: {
            sinkId,
          },
        },
      },
    );

    if (!getLogsResult.response.ok) {
      throw getLogsResult.error;
    }

    const logs = getLogsResult.data!;
    return logs.map((log) => this.logStore.push(log.id, log));
  }
}

export const loggingServiceFactory = createConstructorFactory(LoggingService, {
  name: "logging-service",
});
