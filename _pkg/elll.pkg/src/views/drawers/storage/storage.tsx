import { DrawerContext } from "@repo/shell";
import { useContext, useEffect } from "react";
import { of, switchMap } from "rxjs";
import { DriveDirectoryView } from "~/src/components/ui/trees/drive_directory/drive_directory_view";
import { useElll } from "~/src/hooks/elll/elll";

export function StorageView(): JSX.Element {
  const elll = useElll();
  const context = useContext(DrawerContext);

  useEffect(() => {
    const subscription = elll.tenant$
      .pipe(
        switchMap((tenant) => tenant?.drive$ ?? of(undefined)),
        switchMap((drive) => drive?.uploading$ ?? of(undefined)),
      )
      .subscribe((uploading) => {
        context?.loading$.next(uploading ?? false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [context, elll]);

  return <DriveDirectoryView path="" />;
}
