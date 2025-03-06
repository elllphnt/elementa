import { Facet } from "@codemirror/state";

export type NavigatorSource = (url: string) => void;

export const navigator = Facet.define<NavigatorSource, NavigatorSource>({
  combine: (navigates) => async (url) => {
    const last = navigates[navigates.length - 1];
    last(url);
  },
});
