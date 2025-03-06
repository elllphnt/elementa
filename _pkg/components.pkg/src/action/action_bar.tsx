import { useObservable } from "@repo/utils";
import { useRef, useState } from "react";
import { elllIcons16 } from "../icons/elll_icons";
import Popper from "../popper/popper";
import { PopperMenu } from "../popper/popper_menu";
import { PopperMenuOptionProps } from "../popper/popper_menu_option";
import { Action, ActionRegistry } from "./_model";
import { ActionButton } from "./action";

export function RawActionBar({ actions }: { actions: Action[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inlineActions = actions.length > 6 ? actions.slice(0, 5) : actions;
  const overflowActions = actions.slice(inlineActions.length);
  const [showMore, setShowMore] = useState<PopperMenuOptionProps[] | undefined>(
    undefined,
  );
  let overflowButton = <></>;

  if (overflowActions.length > 0) {
    overflowButton = (
      <ActionButton
        key="overflow"
        action={{
          key: "overflow",
          title: "More",
          icon: elllIcons16.plus,
          active: !!showMore || overflowActions.some((action) => action.active),
          handler: () => {
            setShowMore(
              overflowActions.map((action) => ({
                label: action.title,
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (action.handler) {
                    action.handler(e);
                  } else if (action.options) {
                    setShowMore(action.options);
                  }
                },
                dimmed: !action.active,
              })),
            );
          },
        }}
      />
    );
  }

  return (
    <>
      <div
        ref={ref}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {inlineActions.map((action) => (
          <ActionButton
            key={action.key}
            action={action}
            onMore={(options) => {
              setShowMore(options);
            }}
          />
        ))}
        {overflowButton}
      </div>

      {showMore && (
        <Popper
          anchor={ref.current ?? undefined}
          exclusive
          onClose={() => {
            setShowMore(undefined);
          }}
          align="end"
          filled
          border
          shadow
          offset={6}
        >
          <PopperMenu
            options={showMore.map((option) => ({
              ...option,
              onClick: (e) => {
                setShowMore(undefined);
                option.onClick(e);
              },
            }))}
          />
        </Popper>
      )}
    </>
  );
}

export function ActionBar({ registry }: { registry: ActionRegistry }) {
  const actions = useObservable(registry.actions$, registry.actions);
  return <RawActionBar actions={actions} />;
}
