import { BlueprintEditorState } from "~/src/editors/blueprint";
import { BlueprintData } from "~/src/modules/elementa/project/blueprint/blueprint";
import BlueprintEditor from "./editor";

// Sample Data
const sampleBlueprint: BlueprintData = {
  routes: [
    { id: "root", segment: "/", name: "Home Page" },
    { id: "about", segment: "about", name: "About Us", parentId: "root" },
    {
      id: "products",
      segment: "products",
      name: "Product List",
      parentId: "root",
    },
    {
      id: "product-detail",
      segment: ":productId",
      name: "Product Detail",
      parentId: "products",
      viewId: "ProductView",
    },
    {
      id: "product-reviews",
      segment: "reviews",
      name: "Product Reviews",
      parentId: "product-detail",
    },
    {
      id: "contact",
      segment: "contact",
      name: "Contact Page",
      parentId: "root",
      layoutId: "SimpleLayout",
    },
    { id: "admin", segment: "admin", name: "Admin Section", parentId: "root" },
    {
      id: "admin-users",
      segment: "users",
      name: "Manage Users",
      parentId: "admin",
    },
    {
      id: "admin-settings",
      segment: "settings",
      name: "Admin Settings",
      parentId: "admin",
    },
  ],
};

export function BlueprintBoardView({
  editor,
}: {
  editor: BlueprintEditorState;
}): JSX.Element {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        pointerEvents: "auto",
      }}
    >
      <BlueprintEditor blueprintData={sampleBlueprint} />
    </div>
  );
}
