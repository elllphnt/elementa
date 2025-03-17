import { isExpression } from "@elllphnt/elll-element";
import { ControlProps } from "@repo/components";
import { map } from "rxjs";
import { ScriptControl } from "~/src/components/ui/controls/script";

export function ExpressionTab({
  value,
  value$,
  onChange,
}: ControlProps<any, {}>) {
  return (
    <div className="el-h-full el-w-full el-p-1 el-pt-0">
      <div className="el-h-full el-w-full el-rounded el-overflow-hidden el-bg-bg-100 el-border el-border-fg/5">
        <ScriptControl
          value$={value$?.pipe(
            map((value) =>
              isExpression(value) ? value.__expression : undefined,
            ),
          )}
          value={isExpression(value) ? value.__expression : undefined}
          onChange={(script) => {
            if (script) {
              if (isExpression(value)) {
                onChange?.({
                  ...value,
                  __expression: script,
                });
              } else {
                onChange?.({
                  __expression: script,
                  fallback: value,
                });
              }
            } else {
              if (isExpression(value)) {
                onChange?.(value.fallback);
              } else {
                onChange?.(value);
              }
            }
          }}
          settings={{
            placeholder: "Enter expression here...",
          }}
        />
      </div>
    </div>
  );
}
