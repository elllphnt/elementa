export type ProjectData = {
  id: string;
  name: string;
};

export type FileData = {
  id: string;
  path: string;
  type: string;
};

export type DirectoryEntryData = {
  type: "directory";
  name: string;
  entries: FileTreeData[];
};
export type FileEntryData = {
  type: "file";
  name: string;
  data: FileData;
};
export type FileTreeData = DirectoryEntryData | FileEntryData;
