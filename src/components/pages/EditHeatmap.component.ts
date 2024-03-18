import { MintComponent, component, element, template } from "mint";

import { AltButtons } from "../additions/AltButtons.component";

import { editHeatmapStore } from "../../stores/edit-heatmap.store";

class EditHeatmapComponent extends MintComponent {
  constructor() {
    super();

    editHeatmapStore.connect(this);
  }
}

export const EditHeatmap = component(
  "div",
  EditHeatmapComponent,
  { class: "common-page" },
  [
    element(AltButtons, { type: "edit-heat-map" }),

    element(
      "section",
      { class: "other-content" },
      element("div", { class: "other-content__container" }, [
        element("h2", null, "Edit Heat map"),

        element("p", null, "{day} - {month} - {year}"),

        element(
          "div",
          { style: "white-space: pre-wrap; {currentStyles}" },
          template("renderedMessage")
        ),
      ])
    ),
  ]
);
