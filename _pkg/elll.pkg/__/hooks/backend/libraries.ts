import { LibraryVersion } from "@repo/backend";
import { useObservable } from "@repo/utils";
import { useMemo } from "react";
import { map } from "rxjs";
import { useBackend } from "./backend";

export function usePublicLibraries({
  search,
}: {
  search?: string;
} = {}) {
  const backend = useBackend();
  const libraryStore = backend.libraryStore;
  const librariesQuery = useMemo(() => {
    return libraryStore.query({
      key: "public-libraries",
      resolve: (libraries) => libraries,
      resolve$: (libraries$) => libraries$.pipe(map((libraries) => libraries)),
      fetch: async () => {
        await backend.repositoryService.fetchLibraries({});
      },
      autoFetch: true,
    });
  }, [libraryStore]);

  const libraries = useObservable(librariesQuery.data$, librariesQuery.data);
  const fetching = useObservable(
    librariesQuery.fetching$,
    librariesQuery.fetching,
  );

  return [libraries, { fetching }] as const;
}

export function useLibraryFileAtPath(library: LibraryVersion, path: string) {
  const fileAtPathQuery = library?.fileAtPath(path, {
    autoFetch: true,
  });
  const file = useObservable(fileAtPathQuery?.data$, fileAtPathQuery?.data);
  return [file, fileAtPathQuery] as const;
}
