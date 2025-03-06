import { keys } from "~/src/libs/keys";
import { IElll } from "~/src/types/elll";
import { IElllElementaInfrastructure } from "./_types";
import { ElllElementaInfrastructure } from "./infrastructure";

export function getElllElementaInfrastrcture({
  elll,
}: {
  elll: IElll;
}): IElllElementaInfrastructure {
  let infrastructure = elll.config<IElllElementaInfrastructure>(
    keys.configs.editors.elementa.infrastructure,
  );
  if (!infrastructure) {
    infrastructure = new ElllElementaInfrastructure({ elll });
    infrastructure.elll.setConfig(
      keys.configs.editors.elementa.infrastructure,
      infrastructure,
    );
  }

  return infrastructure;
}
