import { useObservable } from "@repo/utils";
import { memo, useContext } from "react";
import ErrorBoundary from "../error/error_boundary";
import ErrorFallBack from "../error/error_fallback";
import { ViewStoreContext } from "./store/context";

export const View = memo(function View({
  id,
  props = {},
}: {
  id: string;
  props?: Record<string, any>;
}) {
  const store = useContext(ViewStoreContext);
  const view = useObservable(store.view$(id), store.view(id));

  if (!id) {
    return <ErrorFallBack>View id not provided.</ErrorFallBack>;
  }

  if (!view) {
    return <ErrorFallBack>View {id} not found.</ErrorFallBack>;
  }

  const Component = view.render;

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <ErrorFallBack>
          An error occurred while rendering view {id}:<br />
          {error.message}
        </ErrorFallBack>
      )}
    >
      <Component {...props} />
    </ErrorBoundary>
  );
});

export default View;
