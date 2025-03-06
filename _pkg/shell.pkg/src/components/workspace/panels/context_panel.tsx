import { Icon, Tooltip, ViewComponent } from "@repo/components";
import { useObservable } from "@repo/utils";
import cx from "classnames";
import { memo } from "react";
import { EditorState, useShell, useWorkspace } from "~/src";
import { ModalCard } from "~/src/components/modals/modal_card";
import { AnchoredModalBox } from "~/src/components/modals/side_modal/anchored_modal_box";
import InlineSideModalProvider from "~/src/components/modals/side_modal/inline_side_modal_provider";
import ShellSideModalConsumer from "~/src/components/modals/side_modal/shell_side_modal_consumer";
import ShellSideModalProvider from "~/src/components/modals/side_modal/shell_side_modal_provider";
import SideModalContainer from "~/src/components/modals/side_modal/side_modal_container";
import { SideModalRenderer } from "~/src/components/modals/side_modal/side_modal_renderer";
import { Context } from "~/src/models/context";
import { useAllContexts } from "../_hooks/contexts";
import { SideControlMenuContextProvider } from "./_providers/control_menu_context";

function NoContextPanel(): JSX.Element {
  const shell = useShell();
  const placeholderViewId = useObservable(
    shell.properties.value$("contextPanel.placeholder.viewId"),
    shell.properties.value("contextPanel.placeholder.viewId"),
  );

  if (placeholderViewId) {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <ViewComponent id={placeholderViewId} />
      </div>
    );
  } else {
    return (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
          textAlign: "center",
        }}
        className="el-text-fg-500"
      >
        <div>The current editor does not have a context panel.</div>
      </div>
    );
  }
}

function ContextBar({
  contexts,
  activeContextId,
  setActiveContextId,
}: {
  contexts: Context[];
  activeContextId?: string;
  setActiveContextId?: (id: string) => void;
}) {
  return (
    <div
      className="no-scrollbar"
      style={{
        width: "100%",
        height: "100%",
        overflowX: "auto",
        display: "flex",
        alignItems: "center",
        pointerEvents: "auto",
      }}
    >
      {contexts.map((context) => {
        const active = context.id === activeContextId;
        return (
          <Tooltip
            key={context.id}
            content={context.name}
            sideOffset={4}
            delayDuration={0}
          >
            <button
              style={{
                position: "relative",
                height: "100%",
                aspectRatio: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className={cx({
                "el-text-pm-300": active,
                "el-text-fg-300 hover:el-text-fg-400": !active,
              })}
              onClick={() => setActiveContextId?.(context.id)}
            >
              <Icon name={context.icon} className="el-h-4 el-w-4" />

              {active ? (
                <div
                  style={{
                    position: "absolute",
                    height: 3,
                    width: "40%",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "currentColor",
                    borderTopRightRadius: 2,
                    borderTopLeftRadius: 2,
                  }}
                />
              ) : (
                <></>
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
function Panel() {
  const workspace = useWorkspace();
  const editor = useObservable(workspace.activeEditor$, workspace.activeEditor);
  const allContexts = useAllContexts(workspace);
  const activeContextIdStateKey = [
    "context",
    "active",
    allContexts.map((c) => c.id).join(":"),
  ];
  const activeContextId = useObservable(
    workspace.state.value$(activeContextIdStateKey),
    workspace.state.value(activeContextIdStateKey),
    activeContextIdStateKey,
  );
  const activeContext =
    allContexts.find((c) => c.id === activeContextId) ?? allContexts[0];

  let content = <NoContextPanel />;

  if (activeContext) {
    content = (
      <ViewComponent
        key={activeContext.id}
        id={activeContext.panel.viewId}
        props={{
          editor,
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        className="el-border-b"
        style={{
          height: 36,
          flexShrink: 0,
        }}
      >
        <ContextBar
          contexts={allContexts}
          activeContextId={activeContext?.id}
          setActiveContextId={(id) =>
            workspace.state.set(activeContextIdStateKey, id)
          }
        />
      </div>

      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {content}
      </div>
    </div>
  );
}

export const ContextPanel = memo(function ContextPanel({
  editor,
}: {
  editor?: EditorState;
}): JSX.Element {
  return (
    <ShellSideModalProvider affinity="context">
      <SideControlMenuContextProvider>
        <Panel />
      </SideControlMenuContextProvider>

      <SideModalRenderer>
        <InlineSideModalProvider>
          <SideModalContainer side="left" padding={8}>
            <ShellSideModalConsumer affinity="context">
              <AnchoredModalBox axis="y" align="start">
                <SideControlMenuContextProvider>
                  <ModalCard />
                </SideControlMenuContextProvider>
              </AnchoredModalBox>
            </ShellSideModalConsumer>

            <SideModalRenderer>
              <SideModalContainer side="left" padding={8} flushCrossSide>
                <AnchoredModalBox axis="y" align="start">
                  <SideControlMenuContextProvider>
                    <ModalCard />
                  </SideControlMenuContextProvider>
                </AnchoredModalBox>
              </SideModalContainer>
            </SideModalRenderer>
          </SideModalContainer>
        </InlineSideModalProvider>
      </SideModalRenderer>
    </ShellSideModalProvider>
  );
});

export default ContextPanel;
