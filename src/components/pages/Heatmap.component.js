import { component, element, getter, refresh } from "mint";

import { AltButtons } from "../additions/AltButtons.component";

import { path } from "../../services/path.service";
import { wait } from "../../services/wait.service";
import { getTodaysDate } from "../../services/get-todays-date.service";

import { heatmapStore } from "../../stores/heatmap.store";
import { appStore } from "../../stores/app.store";

import { months } from "../../data/months.data";

export const Heatmap = component(
  "div",
  function () {
    heatmapStore.connect(this);

    getter(this, "getShadow", function () {
      return this.title === getTodaysDate()
        ? "z-index shadow-block-orange"
        : "";
    });

    this.oneach = async function () {
      await wait();
      const item = heatmapStore.currentItem;
      if (!item.actions.includes("heatmap")) {
        path.set(["list", ...path.get().slice(1)]);
        refresh(appStore);
        return;
      }
      const date = new Date();
      const [month, year] = [date.getMonth(), date.getFullYear()];
      heatmapStore.year = year;
      heatmapStore.month = months[month];
      heatmapStore.monthStartDay = new Date(year, month + 1, 1).getDay() - 1;
      refresh(this);
    };
  },
  null,
  [
    element(AltButtons),

    element(
      "section",
      { class: "other-content" },
      element("div", { class: "other-content__container" }, [
        element("h2", null, "Heat map"),

        element("p", null, "{month} - {year}"),

        element(
          "ul",
          { class: "list flex", style: "width:224px;" },
          element(
            "li",
            {
              "m-for": "weekDays",
              "m-key": "_i",
              class: "relative width height",
            },
            element(
              "span",
              {
                class: "block absolute middle bold",
              },
              "{_x}"
            )
          )
        ),

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
            [
              element("span", {
                "m-if": "hidden",
                class:
                  "block absolute middle width height smoke-bg border rounded unselect",
              }),
              element(
                "span",
                {
                  "m-if": "!hidden",
                  class:
                    "block absolute middle width height border rounded {getShadow} text-centre line-height bold font-size-small hover pointer unselect",
                  "[title]": "title",
                  "[style]": "style",
                  "(click)": "editHeatmap",
                },
                "{day}"
              ),
            ]
          )
        ),
      ])
    ),
  ]
);
