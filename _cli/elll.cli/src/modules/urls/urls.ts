import {
  getUrlScheme,
  makeElllUrl,
  makeFileId,
  parseElllUrl,
  parseFileId,
} from "@elllphnt/utils";

export function makeLocalFileUrl(bare_id: string) {
  return `local:${bare_id}`;
}
export function parseLocalFileUrl(url: string) {
  const bare_id = url.slice(6);
  return { bare_id };
}

export function makeRelativeFileUrl(from: string, to: string) {
  const fromScheme = getUrlScheme(from);
  const toScheme = getUrlScheme(to);

  if (fromScheme !== toScheme) {
    return to;
  }

  switch (fromScheme) {
    case "local": {
      return to;
    }
    case "elll": {
      return makeRelativeElllFileUrl(from, to);
    }
    default: {
      return to;
    }
  }
}
export function makeRelativeElllFileUrl(from: string, to: string) {
  const fromUrlStruct = parseElllUrl(from);
  const toUrlStruct = parseElllUrl(to);

  if (!fromUrlStruct || !toUrlStruct) {
    return to;
  }

  const fromStruct = parseFileId(fromUrlStruct.id);
  const toStruct = parseFileId(toUrlStruct.id);

  if (
    fromStruct &&
    toStruct &&
    fromStruct.entity === toStruct.entity &&
    fromStruct.bare_drive_id === toStruct.bare_drive_id
  ) {
    return makeLocalFileUrl(toStruct.bare_file_id);
  } else {
    return makeElllUrl(to);
  }
}

export function makeAbsoluteFileUrl(base: string, url: string) {
  const scheme = getUrlScheme(url);
  if (scheme !== "local") {
    return url;
  }

  const baseScheme = getUrlScheme(base);
  switch (baseScheme) {
    case "elll": {
      return makeAbsoluteElllFileUrl(base, url);
    }
    default: {
      return url;
    }
  }
}
export function makeAbsoluteElllFileUrl(base: string, url: string) {
  const { bare_id } = parseLocalFileUrl(url);

  const baseUrlStruct = parseElllUrl(base);
  if (!baseUrlStruct) {
    throw new Error("Invalid base url");
  }

  const baseStruct = parseFileId(baseUrlStruct.id);
  if (!baseStruct) {
    throw new Error("Invalid base file id");
  }

  const file_id = makeFileId({
    entity: baseStruct.entity.name as any,
    bare_drive_id: baseStruct.bare_drive_id,
    bare_file_id: bare_id,
  });
  if (!file_id) {
    throw new Error(`Invalid file id: ${bare_id}`);
  }
  const fileUrl = makeElllUrl(file_id);
  return fileUrl;
}
