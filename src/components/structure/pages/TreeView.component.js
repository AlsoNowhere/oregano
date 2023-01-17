import { component, element, getter, template } from "mint";

import { AltButtons } from "./structure/AltButtons.component";

import { treeStore } from "../../../stores/tree.store";

const Tree = component(
  "ul",
  function () {
    this.tree = [];

    getter(this, "hasTree", function () {
      return this.items.length > 0;
    });

    getter(this, "treeRepeater", () =>
      element(Tree, { "m-if": "hasTree", "[tree]": "items" })
    );
  },
  null,
  element("li", { "m-for": "tree", "m-key": "_i" }, [
    element("p", null, "{title}"),
    template("treeRepeater"),
  ])
);

export const TreeView = component(
  "div",
  function () {
    treeStore.connect(this);
  },
  null,
  [
    element(AltButtons),

    element("section", { class: "constrain centred" }, [
      element("div", null, "{currentTitle}"),

      element(Tree, { "[tree]": "currentList" }),
    ]),
  ]
);
