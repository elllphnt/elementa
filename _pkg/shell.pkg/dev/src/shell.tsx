import { useCallback } from "react";
import { Observable, of } from "rxjs";
import { Shell, View, useSideModalProvider } from "../../src";
import { Activity } from "../../src/models/activity";
import { Editor, EditorState, EditorStateData } from "../../src/models/editor";

const shell = new Shell();

class TestEditorState extends EditorState {
  private _title: string;
  private _icon: string;

  constructor({ title, icon }: { title: string; icon: string }) {
    super({ editorId: "test" });
    this._title = title;
    this._icon = icon;
  }

  get title$(): Observable<string> {
    return of(this._title);
  }
  get title(): string {
    return this._title;
  }
  get icon$(): Observable<any> {
    return of(this._icon);
  }
  get icon(): any {
    return this._icon;
  }
  get data(): EditorStateData {
    return {
      ...super._data,
    };
  }
  get data$(): Observable<EditorStateData> {
    return of(this.data);
  }
  restore(data: EditorStateData): void {
    throw new Error("Method not implemented.");
  }
  restoreDiff(data: Partial<EditorStateData>): void {
    throw new Error("Method not implemented.");
  }
}

const testEditor: Editor = {
  id: "test",
  createState: () =>
    new TestEditorState({
      title: "Test Editor Test Editor Test Editor Test Editor",
      icon: "test",
    }),
  views: {
    board: "p1",
    context: "p2",
    outline: "p3",
  },
};

const a1: Activity = {
  id: "a1",
  name: "Activity 1",
  type: "primary",
  panel: {
    viewId: "p1",
  },
};
const a2: Activity = {
  id: "a2",
  name: "Activity 2",
  type: "primary",
  panel: {
    viewId: "p2",
  },
};
const a3: Activity = {
  id: "a3",
  name: "Activity 3",
  type: "secondary",
  panel: {
    viewId: "p3",
  },
};

const p1: View = {
  id: "p1",
  render: () => {
    const { showSideModal, hideSideModal } = useSideModalProvider();
    const { openMenu } = useMenu();

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      shell.showContextMenu({
        position: { x: e.clientX, y: e.clientY },
        options: [
          [
            {
              label: "Option 1",
              action: () => {
                shell.toast({
                  message: "Option 1",
                });
              },
            },
            {
              label: "Option 2",
              submenu: [
                [
                  {
                    label: "Option 1",
                    action: () => {
                      shell.toast({
                        message: "Option 1",
                      });
                    },
                  },
                  { label: "Option 2" },
                  { label: "Option 3" },
                ],
              ],
            },
            { label: "Option 3" },
          ],
          [{ label: "Option 1" }, { label: "Option 2" }, { label: "Option 3" }],
          [{ label: "Option 1" }, { label: "Option 2" }, { label: "Option 3" }],
          [{ label: "Option 1" }, { label: "Option 2" }, { label: "Option 3" }],
        ],
      });
    }, []);

    return (
      <div
        className="el-h-full el-w-full el-flex el-flex-col"
        onContextMenu={handleContextMenu}
      >
        <button
          onClick={() => {
            shell.toast({
              message: "Hello, world! className=absolut",
            });
          }}
        >
          Toast
        </button>

        <button
          onClick={() => {
            shell.showNotification({
              title: "Failed to notify",
              message: "This is a notification message.",
              duration: 5000,
            });
          }}
        >
          Notify
        </button>

        <button
          onClick={() => {
            shell.showModal({
              affinity: "workspace",
              viewId: "p8",
              closeOnBackdropClick: true,
            });
          }}
        >
          Bench Modal
        </button>

        <button
          onClick={(e) => {
            openMenu({
              viewId: "p8",
              anchor: e.currentTarget,
            });
          }}
        >
          Context Modal
        </button>

        <button
          onClick={(e) => {
            showSideModal({
              viewId: "p7",
              anchor: e.currentTarget,
            });
          }}
        >
          Activity Modal
        </button>
      </div>
    );
  },
};
const appBar: View = {
  id: "p2",
  render: () => {
    const { showSideModal } = useSideModalProvider();
    return (
      <div className="el-h-full el-w-full el-flex el-items-center justify-end">
        <button
          onClick={(e) => {
            showSideModal({
              viewId: "p8",
              anchor: e.currentTarget,
            });
          }}
        >
          Show Modal
        </button>
      </div>
    );
  },
};
const p3: View = {
  id: "p3",
  render: () => <div>Panel 3</div>,
};
const p4: View = {
  id: "p4",
  render: () => <div>Panel 4</div>,
};
const p5: View = {
  id: "p5",
  render: () => <div>Panel 5</div>,
};
const p6: View = {
  id: "p6",
  render: () => <div>Panel 6</div>,
};
const p7: View = {
  id: "p7",
  render: () => <div>Panel 7</div>,
};
const p8: View = {
  id: "p8",
  render: () => (
    <div
      style={{
        height: 300,
        width: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      Panel 7
    </div>
  ),
};

shell.loadActivities(a1, a2, a3);
shell.loadViews(p1, appBar, p3, p4, p5, p6, p7, p8);
shell.loadEditors(testEditor);
shell.properties.set("appBar.viewId", appBar.id);

const activeArea = shell.workspace.activeArea;
if (activeArea) {
  const editor1 = shell.createEditorState({ editorId: "test" });
  const editor2 = shell.createEditorState({ editorId: "test" });
  const editor3 = shell.createEditorState({ editorId: "test" });
  if (editor1) {
    editor1.stabilize();
    activeArea.addEditor(editor1);
  }
  if (editor2) {
    activeArea.addEditor(editor2);
    editor2.stabilize();
  }
  if (editor3) {
    activeArea.addEditor(editor3);
  }
}

export default shell;
