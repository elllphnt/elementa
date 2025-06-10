import { PackageSheetData } from "@elllphnt/elementa-base";
import { BehaviorSubject, Observable } from "rxjs";
import { PackageSheet } from "~/models/_.js";
import { BaseModel } from "../_base.js";
import { File } from "~/project/_.js";

export class PackageSheetModel
  extends BaseModel<PackageSheetData>
  implements PackageSheet
{
  constructor({ init, file }: { init: PackageSheetData; file: File }) {
    super();
  }
}
