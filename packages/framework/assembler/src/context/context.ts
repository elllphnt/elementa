import type { FileSystem } from "./fs/fs.js";
import type { ElementaInfrastructure } from "./infra/infra.js";
import type { Logger } from "./logger.js";

export type GeneratorContext = {
  infra: ElementaInfrastructure;
  out: FileSystem;
  log: Logger;
};
