import { component, element } from "mint";

import { Line } from "basil";

import { AltButtons } from "../additions/AltButtons.component";

import { graphStore } from "../../stores/graph.store";

const flattenData = (() => {
  let index = 0;
  return (list, arr) => {
    if (!(arr instanceof Array)) {
      arr = [];
      index = 0;
    }
    list.forEach((item) => {
      if (item.title.includes(" -- ")) {
        const [label, y] = item.title.split(" -- ");
        arr.push({ x: index++, y: parseFloat(y), label });
      }
      item.items instanceof Array && flattenData(item.items, arr);
    });
    return arr;
  };
})();

export const GraphView = component(
  "div",
  function () {
    graphStore.connect(this);

    this.svgElementRef = null;

    this.oneach = function () {
      setTimeout(() => {
        new Line(this.svgElementRef, flattenData(graphStore.currentList));
      }, 0);
    };
  },
  null,
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
          class: "border",
          style: "width:600px;height:300px;",
          "m-ref": "svgElementRef",
        }),
      ])
    ),
  ]
);
