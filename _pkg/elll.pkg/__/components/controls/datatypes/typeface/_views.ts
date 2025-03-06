import { View } from "@repo/components";
import { TypefaceBrowser } from "./browser/typeface_browser";
import { TypefaceSelector } from "./selector";
import { GoogleTypefaceBrowser } from "./browser/google_typeface_browser";

export const typefaceControlViews = {
  selector: {
    id: "controls.datatypes.typeface.selector",
    render: TypefaceSelector,
  },
  browser: {
    id: "controls.datatypes.typeface.browser",
    render: TypefaceBrowser,
  },
  googleBrowser: {
    id: "controls.datatypes.typeface.browsers.google",
    render: GoogleTypefaceBrowser,
  },
} satisfies Record<string, View>;
