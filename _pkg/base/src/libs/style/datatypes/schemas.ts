import * as Yup from "yup";
import { StyleDataType } from "../../../types/_primitives/style/datatypes.js";

export const booleanSchema = Yup.boolean().required();

export const numberSchema = Yup.number().required();

export const stringSchema = Yup.string().required();

export const angleSchema = Yup.object({
  value: Yup.number().required(),
  unit: Yup.string().oneOf(["deg", "rad", "grad", "turn"]).required(),
});

export const colorSchema = Yup.object({
  model: Yup.string()
    .oneOf(["rgb", "hsl", "hwb", "lab", "lch", "oklab", "oklch"])
    .required(),
  value: Yup.array().of(Yup.number().required()).min(3).required(),
  alpha: Yup.number(), // optional
});

export const durationSchema = Yup.object({
  value: Yup.number().required(),
  unit: Yup.string().oneOf(["s", "ms"]).required(),
});

export const flexSchema = Yup.object({
  value: Yup.number().required(),
  unit: Yup.string().oneOf(["fr"]).required(),
});

export const lengthSchema = Yup.object({
  value: Yup.number().required(),
  unit: Yup.string().oneOf(["px", "em", "rem", "vh", "vw"]).required(),
});

export const percentSchema = Yup.object({
  value: Yup.number().required(),
  unit: Yup.string().oneOf(["%"]).required(),
});

export const ratioSchema = Yup.array()
  .of(Yup.number().required())
  .length(2)
  .required();

export const styleDataSchemas: Record<StyleDataType, Yup.Schema> = {
  [StyleDataType.Boolean]: booleanSchema,
  [StyleDataType.Number]: numberSchema,
  [StyleDataType.String]: stringSchema,
  [StyleDataType.Angle]: angleSchema,
  [StyleDataType.Color]: colorSchema,
  [StyleDataType.Duration]: durationSchema,
  [StyleDataType.Flex]: flexSchema,
  [StyleDataType.Length]: lengthSchema,
  [StyleDataType.Percent]: percentSchema,
  [StyleDataType.Ratio]: ratioSchema,
};
