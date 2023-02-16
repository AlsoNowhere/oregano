import { component, element, getter } from "mint";

import { AltButtons } from "../additions/AltButtons.component";

import { heatmapStore } from "../../stores/heatmap.store";

import { months } from "../../data/months.data";

export const Heatmap = component(
  "div",
  function () {
    heatmapStore.connect(this);

    this.oneach = function () {
      const date = new Date();
      const [month, year] = [date.getMonth(), date.getFullYear()];
      heatmapStore.month = months[month];
      heatmapStore.monthStartDay = new Date(year, month + 1, 1).getDay() - 1;
    };

    getter(this, "getTitle", function () {
      return this._i + 1 - heatmapStore.monthStartDay;
    });
  },
  null,
  [
    element(AltButtons),

    element(
      "section",
      { class: "other-content" },
      element("div", { class: "other-content__container" }, [
        element("h2", null, "Heat map"),

        element("p", null, "{month}"),

        element(
          "ul",
          { class: "list flex", style: "width:224px;" },
          element(
            "li",
            {
              "m-for": "heatmap",
              "m-key": "_i",
              class: "relative width height",
            },
            element("span", {
              "m-if": "!hidden",
              class:
                "block absolute middle width-small height-small border rounded",
              title: "{getTitle}",
              style: "{fill}",
            })
          )
        ),
      ])
    ),
  ]
);
