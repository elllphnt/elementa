import { map, of, switchMap } from "rxjs";
import { IElll } from "~/src/types/elll";

export function nameFromPath(path: string): string {
  if (path === "pages/index") {
    return "home";
  }

  const _path = path.split("/");
  const last = _path[_path.length - 1];
  const beforeLast = _path[_path.length - 2];
  if (last === "index" && beforeLast) {
    return beforeLast;
  } else {
    return last;
  }
}

export function elllFileAtPathQuery(
  elll: IElll,
  path: string,
  create?: {
    type: string;
  },
) {
  return elll.repository?.workspace?.fileAtPath(path, {
    autoFetch: true,
    create,
  });
}
export function elllFileAtPathQuery$(
  elll: IElll,
  path: string,
  create?: {
    type: string;
  },
) {
  return elll.repository$.pipe(
    switchMap((repository) => {
      return repository?.workspace$ ?? of(undefined);
    }),
    map((workspace) => {
      return workspace?.fileAtPath(path, {
        autoFetch: true,
        create,
      });
    }),
  );
}

export function elllFileAtPath(
  elll: IElll,
  path: string,
  create?: {
    type: string;
  },
) {
  return elllFileAtPathQuery(elll, path, create)?.data;
}
export function elllFileAtPath$(
  elll: IElll,
  path: string,
  create?: {
    type: string;
  },
) {
  return elllFileAtPathQuery$(elll, path, create)?.pipe(
    switchMap((query) => query?.data$ ?? of(undefined)),
  );
}
