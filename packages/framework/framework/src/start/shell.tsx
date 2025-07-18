import type { AnyRoute, Router } from "@tanstack/react-router";
import { ElementaApp } from "./app.js";

export function ElementaShell({
  router,
  styles = [],
  scripts = [],
}: {
  router: Router<AnyRoute>;
  styles?: string[];
  scripts?: string[];
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Elll App</title>
        {styles.map((style, index) => (
          <link key={index} rel="stylesheet" href={style} />
        ))}
      </head>
      <body>
        <div id="app">
          <ElementaApp router={router} />
        </div>
        {scripts.map((script, index) => (
          <script key={index} src={script} />
        ))}
      </body>
    </html>
  );
}
