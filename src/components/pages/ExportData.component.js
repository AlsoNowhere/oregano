import { component, element } from "mint";

import { Field } from "../common/Field.component";

import { AltButtons } from "../additions/AltButtons.component";

import { exportStore } from "../../stores/export.store";

export const ExportData = component(
  "div",
  function () {
    exportStore.connect(this);
  },
  null,
  [
    element(AltButtons),
    element("section", { class: "other-content" }, [
      element("h2", null, "{currentTitle}"),
      element(
        "form",
        { name: "export-data", class: "form" },
        element(Field, {
          type: "textarea",
          label: "Export data",
          name: "export-data",
          "[value]": "currentValue",
          fieldStyles:
            "height:300px;font-size:1rem;line-height:1.1rem;resize:none;",
        })
      ),
    ]),
  ]
);
