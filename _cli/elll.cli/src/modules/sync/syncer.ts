import { fileTypeMatch } from "@elllphnt/utils";
import { SyncContext } from "./context.js";

export type Syncer = {
  updatePath: ({
    id,
    path,
    context,
  }: {
    id: string;
    path: string;
    context: SyncContext;
  }) => Promise<void>;
  updateContent: ({
    id,
    context,
  }: {
    id: string;
    path: string;
    context: SyncContext;
  }) => Promise<void>;
};
export const syncers: Record<string, Syncer> = {};

export function getSyncer(type: string) {
  for (const syncerType in syncers) {
    if (fileTypeMatch(type, syncerType)) {
      return syncers[syncerType];
    }
  }
}
export function registerSyncer(type: string, syncer: Syncer) {
  syncers[type] = syncer;
}
