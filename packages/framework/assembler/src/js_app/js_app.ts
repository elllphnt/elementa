export type BaseJsRoute = {
  id: string;
  path: string;
};

export type PageJsRoute = BaseJsRoute & {
  type: "page";
  dynamic: boolean;
};

export type HandlerJsRoute = BaseJsRoute & {
  type: "handler";
  functionId: string;
};

export type JsRoute = PageJsRoute | HandlerJsRoute;

export type JsAppConfig = {
  id: string;
  routes: JsRoute[];
  importMap: Record<string, string>;
};
