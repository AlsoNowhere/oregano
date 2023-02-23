import { component, element } from "mint";

import { Field } from "../common/Field.component";
import { Button } from "../common/Button.component";

import { AltButtons } from "../additions/AltButtons.component";

import { importStore } from "../../stores/import.store";
import { wait } from "../../services/wait.service";

export const ImportData = component(
  "div",
  function () {
    importStore.connect(this);

    this.oneach = function () {
      importStore.importValue = "";
      (async () => {
        await wait();
        this.importFormElement?.["importValue"]?.focus();
      })();
    };
  },
  null,
  [
    element(AltButtons),

    element(
      "div",
      { class: "other-content" },
      element("section", { class: "other-content__container" }, [
        element("h2", { class: "no-margin" }, "Import into - {currentTitle}"),

        element(
          "form",
          {
            class: "form",
            "(submit)": "onSubmit",
            "m-ref": "importFormElement",
          },
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
      ])
    ),
  ]
);
