import { MintComponent, component, element, getter, template } from "mint";

import { Item } from "../../../models/Item.model";

class TreeComponent extends MintComponent {
  tree: Array<Item>;

  constructor() {
    super();

    this.tree = [];

    getter(this, "hasTree", function () {
      return this.items?.length > 0;
    });

    getter(this, "treeRepeater", () =>
      element(Tree, { mIf: "hasTree", "[tree]": "items" })
    );
  }
}

export const Tree = component(
  "ul",
  TreeComponent,
  null,
  element("li", { mFor: "tree", mKey: "_i" }, [
    element("p", null, "{title}"),
    template("treeRepeater"),
  ])
);
