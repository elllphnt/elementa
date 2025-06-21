/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProjectData = {
  id: string;
  name: string;
};

export type FileData = {
  id: string;
  path: string;
  type: string;
};

export type TreeNode<D = any> = {
  id: string;
  name: string;
  type: "project" | "directory" | "file";
  path: string;
  children?: TreeNode[];
  expanded?: boolean;
  data: D;
};
