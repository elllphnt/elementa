import { PropsWithChildren } from "react";
import { Observable } from "rxjs";
import { useObservable } from "@repo/utils";

export function Conditional({
  condition,
  condition$,
  children,
}: PropsWithChildren<{
  condition$: Observable<boolean>;
  condition: boolean;
}>) {
  const _condition = useObservable(condition$, condition);
  return _condition ? <>{children}</> : <></>;
}
