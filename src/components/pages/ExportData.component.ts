import { MintComponent, component, element } from "mint";

import { styles } from "sage";

import { Field, TField } from "thyme";

import { AltButtons } from "../additions/AltButtons.component";

import { exportStore } from "../../stores/export.store";

export const ExportData = component(
  "div",
  class ExportDataComponent extends MintComponent {
    constructor() {
      super();

      exportStore.connect(this);
    }
  },
  { class: "common-page" },
  [
    element(AltButtons),
    element(
      "div",
      { class: "other-content" },
      element("section", { class: "other-content__container" }, [
        element("h2", null, "{currentTitle}"),
        element(
          "form",
          { name: "export-data", class: "form", mRef: "formElementRef" },
          element<TField>(Field, {
            type: "textarea",
            label: "Export data",
            name: "export-data",
            "[value]": "currentValue",
            fieldStyles: styles({
              height: "300px",
              "font-size": "1rem",
              "line-height": "1.1rem",
              resize: "none",
            }),
          })
        ),
      ])
    ),
  ]
);
