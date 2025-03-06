import { IconButton } from "../controls/_";
import { Tooltip } from "../tooltip";
import { Action } from "./_model";

export function ActionButton({
  action,
  onMore,
}: {
  action: Action;
  onMore?: (options: Action["options"]) => void;
}) {
  return (
    <Tooltip delayDuration={0} content={action.title} sideOffset={4}>
      <IconButton
        key={action.key}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (action.handler) {
            action.handler(e);
          } else if (action.options) {
            onMore?.(action.options);
          }
        }}
        active={action.active}
        icon={action.icon}
      />
    </Tooltip>
  );
}
