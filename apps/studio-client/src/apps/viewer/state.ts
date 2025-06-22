/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewerStateData = {
  explorer: {
    tab: string;
    folders: any;
  };
  board: {
    projectId: string;
    fileId: string;
  };
};

interface ViewerState extends ViewerStateData {
  setExplorerTab: (tab: string) => void;
  setExplorerFolderState: (key: string, state: any) => void;
  setBoardData: (projectId: string, fileId: string) => void;
  resetState: () => void;
}

const initialState: ViewerStateData = {
  explorer: {
    tab: "infrastructure",
    folders: {},
  },
  board: {
    projectId: "",
    fileId: "",
  },
};

export const useViewerState = create<ViewerState>()(
  persist(
    (set) => ({
      ...initialState,
      setExplorerTab: (tab) =>
        set((state) => ({
          explorer: { ...state.explorer, tab },
        })),
      setExplorerFolderState: (key, folderState) =>
        set((state) => ({
          explorer: {
            ...state.explorer,
            folders: {
              ...state.explorer.folders,
              [key]: folderState,
            },
          },
        })),
      setBoardData: (projectId, fileId) =>
        set((state) => ({
          board: { ...state.board, projectId, fileId },
        })),
      resetState: () => set(initialState),
    }),
    {
      name: "viewer-state-storage",
      partialize: (state) => ({
        explorer: state.explorer,
        board: state.board,
      }),
    }
  )
);
