import { MintComponent, component, element, span } from "mint";

import { AltButtons } from "../additions/AltButtons.component";

import { heatmapStore } from "../../stores/heatmap.store";

class HeatmapComponent extends MintComponent {
  constructor() {
    super();

    heatmapStore.connect(this);
  }
}

export const Heatmap = component(
  "div",
  HeatmapComponent,
  { class: "common-page" },
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
              mFor: "weekDays",
              mKey: "_i",
              class: "relative width height",
            },
            span({ class: "block absolute middle bold" }, "{_x}")
          )
        ),

        element(
          "ul",
          { class: "list flex", style: "width:224px;" },
          element(
            "li",
            {
              mFor: "heatmap",
              mKey: "_i",
              class: "relative width height",
            },
            [
              element("span", {
                mIf: "hidden",
                class:
                  "block absolute middle width height smoke-bg border rounded unselect",
              }),
              element(
                "span",
                {
                  mIf: "!hidden",
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
