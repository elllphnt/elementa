import { FileSystem } from "./fs/fs.js";
import { ElementaInfrastructure } from "./infra/infra.js";
import { Logger } from "./logger.js";

export type GeneratorContext = {
  infra: ElementaInfrastructure;
  out: FileSystem;
  log: Logger;
};
