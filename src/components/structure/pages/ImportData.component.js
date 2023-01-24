import { component, element } from "mint";

import { AltButtons } from "./structure/AltButtons.component";
import { Field } from "../../common/Field.component";
import { Button } from "../../common/Button.component";

import { importStore } from "../../../stores/import.store";

export const ImportData = component(
  "div",
  function () {
    importStore.connect(this);
  },
  null,
  [
    element(AltButtons),

    element("section", { class: "constrain centred" }, [
      element("h2", { class: "no-margin" }, "Import into - {currentTitle}"),

      element(
        "form",
        { class: "form", "(submit)": "onSubmit", "m-ref": "importFormElement" },
        [
          element(Field, {
            type: "textarea",
            name: "importValue",
            label: "Enter JSON data here",
            "[value]": "importValue",
            fieldStyles: "",
            "[onInput]": "onInput",
          }),
          element(Button, {
            type: "submit",
            class: "button apple large padded",
            label: "Import data",
          }),
        ]
      ),
    ]),
  ]
);
