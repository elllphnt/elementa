import _ from "lodash";
import { CommandHandler } from "~/_types/managers/command";
import { Handle } from "~/handles/handle";

export const selectAll: CommandHandler = (interactor) => {
  const selection = interactor.interactionManager.selection;
  let nextSelection: Handle[] = [];

  if (selection.length === 0) {
    nextSelection = interactor.frames ?? [];
  } else {
    nextSelection = _.uniq(
      selection
        .map((handle) => {
          const siblingAndSelf = handle.parent?.children ?? [];
          return siblingAndSelf;
        })
        .flat()
    ) as Handle[];
  }
  interactor.interactionManager.select(nextSelection);
};
