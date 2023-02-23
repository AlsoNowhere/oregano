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
        const data = flattenData(graphStore.currentList);
        const maxY = Math.ceil(
          data.reduce((a, b) => (b.y > a ? b.y : a), -Infinity)
        );
        const minY = Math.floor(
          data.reduce((a, b) => (b.y < a ? b.y : a), Infinity)
        );
        new Line(this.svgElementRef, data, {
          xLabelsAreVertical: true,
          borderColour: "lightgrey",
          pointColour: "#3d7fe3",
          lineColour: "#3d7fe3",
          pointSize: 3,
          tooltip: true,
          maxY,
          minY,
        });
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
          class: "",
          viewBox: "0 0 836 420",
          style: "width:836px;height:420px;",
          "m-ref": "svgElementRef",
        }),
      ])
    ),
  ]
);
