import { SchemaData } from "@elllphnt/elll-element";
import {
  BooleanControl,
  ControlProps,
  ExpressionControl,
  NumberControl,
  StringControl,
} from "@repo/components";
import { ElllControlType } from "./_types";
import { Control } from "./control";

export function SchemaControl({
  value,
  value$,
  onChange,
  settings,
}: ControlProps<
  any,
  {
    schema?: SchemaData;
  }
>) {
  if (settings?.schema?.control?.type) {
    return (
      <Control
        type={settings.schema.control.type as ElllControlType}
        value$={value$}
        value={value}
        onChange={onChange}
        settings={settings.schema.control.options}
      />
    );
  } else {
    switch (settings?.schema?.type) {
      case "number": {
        return (
          <NumberControl
            value$={value$}
            value={value}
            onChange={onChange}
            settings={settings.schema.control?.options as any}
          />
        );
      }
      case "string": {
        return (
          <StringControl
            value$={value$}
            value={value}
            onChange={onChange}
            settings={settings.schema.control?.options as any}
          />
        );
      }
      case "boolean": {
        return (
          <BooleanControl
            value$={value$}
            value={value}
            onChange={onChange}
            settings={settings.schema.control?.options as any}
          />
        );
      }
      default: {
        return (
          <ExpressionControl
            value$={value$}
            value={value}
            onChange={onChange}
          />
        );
      }
    }
  }
}
