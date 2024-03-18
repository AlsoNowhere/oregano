import { MintComponent, component, element } from "mint";

import { AltButtons } from "../additions/AltButtons.component";

import { graphStore } from "../../stores/graph.store";

class GraphviewComponent extends MintComponent {
  constructor() {
    super();

    graphStore.connect(this);
  }
}

export const GraphView = component(
  "div",
  GraphviewComponent,
  { class: "common-page" },
  [
    element(AltButtons),

    element(
      "section",
      { class: "other-content" },
      element("div", { class: "other-content__container" }, [
        element(
          "div",
          { class: "other-content__title margin-bottom" },
          "{currentTitle}"
        ),
        element("svg", {
          class: "",
          viewBox: "0 0 836 420",
          style: "width:836px;height:420px;",
          mRef: "svgElementRef",
        }),
      ])
    ),
  ]
);
