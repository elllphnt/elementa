import { parseEntityId } from "@elllphnt/utils";
import { File, isElllResourceUrl, parseElllResourceUrl } from "@repo/backend";
import { useDrag, useDrop } from "@repo/shell";
import { combineLatestOrEmpty, useObservable } from "@repo/utils";
import { useMemo } from "react";
import { map, switchMap } from "rxjs";
import { mimeTypes } from "../../libs/constants/mime_types";

export function useSortedFileTreeEntries(directory: File) {
  const entriesQuery = directory.entries({ autoFetch: true });

  const [_entriesWithNameType$, _entriesWithNameType] = useMemo(() => {
    const entriesWithNameType$ = entriesQuery.data$.pipe(
      switchMap((entries) =>
        combineLatestOrEmpty(
          entries.map((entry) =>
            combineLatestOrEmpty([entry.name$, entry.type$]).pipe(
              map(([name, type]) => ({ name, type, entry })),
            ),
          ),
        ),
      ),
    );
    const entriesWithNameType = entriesQuery.data.map((entry) => ({
      name: entry.name,
      type: entry.type,
      entry,
    }));

    return [entriesWithNameType$, entriesWithNameType] as const;
  }, [entriesQuery]);

  const entriesWithNameType = useObservable(
    _entriesWithNameType$,
    _entriesWithNameType,
  );

  const directoryEntries: File[] = [];
  const fileEntries: File[] = [];

  for (const entry of entriesWithNameType) {
    if (entry.type === "directory") {
      directoryEntries.push(entry.entry);
    } else {
      fileEntries.push(entry.entry);
    }
  }

  // sort entry lists in place
  directoryEntries.sort((a, b) => a.name?.localeCompare(b.name ?? "") || 0);
  fileEntries.sort((a, b) => a.name?.localeCompare(b.name ?? "") || 0);

  return [directoryEntries, fileEntries] as const;
}

export function useFileDrag(file: File) {
  return useDrag(
    {
      getData: () => ({
        [mimeTypes.uriList]: file.url,
        [mimeTypes.text]: file.url,
        name: file.name,
      }),
    },
    [file],
  );
}

export function useFileDrop(file: File) {
  return useDrop(
    {
      accept: [mimeTypes.uriList],
      canDrop: (data) => {
        const uris = data[mimeTypes.uriList] as string | undefined;
        if (!uris) {
          return false;
        }

        const allowedList = uris.split("\n").map((uri) => {
          // ignore if file is not directory
          if (!file.isDirectory) {
            return false;
          }

          // ignore if no url
          if (!uri) {
            return false;
          }

          // ignore if same url
          if (uri === file.url) {
            return false;
          }

          // only accept elll resource urls
          if (!isElllResourceUrl(uri)) {
            return false;
          }

          // only accept same resource type
          const { id } = parseElllResourceUrl(uri);
          const { entity } = parseEntityId(id) ?? {};
          if (entity?.name !== file.entity) {
            return false;
          }

          const droppingFile = file.fileStore.instance(id);

          // ignore if dropping file is not found
          if (!droppingFile) {
            return false;
          }

          // prevent dropping into child
          if (file.isDescendantOf(droppingFile)) {
            return false;
          }

          return true;
        });

        return allowedList.some((allowed) => allowed);
      },
      onDrop: (data) => {
        const uris = data[mimeTypes.uriList] as string | undefined;
        if (!uris) {
          return;
        }

        uris.split("\n").forEach((uri) => {
          if (!uri) {
            return;
          }

          const { id } = parseElllResourceUrl(uri);
          const droppingFile = file.fileStore.instance(id);

          if (!droppingFile) {
            return;
          }

          droppingFile.moveTo(file);
        });
      },
    },
    [file],
  );
}
