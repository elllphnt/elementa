/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElementaRenderableManager } from "@elllphnt/elementa-scene";
import { BehaviorSubject } from "rxjs";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewerStateData = {
  explorer: {
    tab: string;
    folders: any;
  };
  inspector: {
    tab: string;
  };
  board: {
    projectId: string;
    fileId: string;
  };
};

interface ViewerState extends ViewerStateData {
  setExplorerTab: (tab: string) => void;
  setExplorerFolderState: (key: string, state: any) => void;
  setInspectorTab: (tab: string) => void;
  setBoardData: (projectId: string, fileId: string) => void;
  resetState: () => void;
}

const initialState: ViewerStateData = {
  explorer: {
    tab: "infrastructure",
    folders: {},
  },
  inspector: {
    tab: "style",
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
      setInspectorTab: (tab) =>
        set((state) => ({
          inspector: { ...state.inspector, tab },
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
        inspector: state.inspector,
        board: state.board,
      }),
    }
  )
);

export const sceneManager = new BehaviorSubject<
  ElementaRenderableManager | undefined
>(undefined);
export const sceneIframe = new BehaviorSubject<HTMLIFrameElement | undefined>(
  undefined
);
export function setSceneManager(manager: ElementaRenderableManager) {
  sceneManager.next(manager);
}
export function setSceneIframe(iframe: HTMLIFrameElement | undefined | null) {
  sceneIframe.next(iframe || undefined);
}
