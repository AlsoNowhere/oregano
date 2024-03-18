import { MintComponent, component, element } from "mint";

import { AltButtons } from "../../additions/AltButtons.component";

import { treeStore } from "../../../stores/tree.store";

import { Tree } from "./Tree.component";

class TreeViewComponent extends MintComponent {
  constructor() {
    super();

    treeStore.connect(this);
  }
}

export const TreeView = component(
  "div",
  TreeViewComponent,
  { class: "common-page" },
  [
    element(AltButtons),

    element(
      "div",
      { class: "other-content" },
      element("section", { class: "other-content__container" }, [
        element("div", { class: "other-content__title" }, "{currentTitle}"),

        element(Tree, { "[tree]": "currentList" }),
      ])
    ),
  ]
);
