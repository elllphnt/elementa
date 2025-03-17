export enum DynamicType {
  Expression,
  StyleVariable,
  DriveFile,
}
export type DynamicSpec = {
  type: DynamicType;
  options?: any;
};

export const expressionDynamic = (): DynamicSpec => ({
  type: DynamicType.Expression,
});
export const styleVariableDynamic = (): DynamicSpec => ({
  type: DynamicType.StyleVariable,
});
export const driveFileDynamic = (): DynamicSpec => ({
  type: DynamicType.DriveFile,
});
