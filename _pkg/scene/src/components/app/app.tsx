import { JSX, memo } from "react";
import { AppRenderable } from "../../renderables/app/app";

export const AppComponent = memo(function ({
  app,
}: {
  app: AppRenderable;
}): JSX.Element {
  return <>App : {app.key}</>;
});

export default AppComponent;
