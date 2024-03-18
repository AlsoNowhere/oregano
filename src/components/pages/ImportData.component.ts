import { MintComponent, component, element } from "mint";

import { styles, wait } from "sage";

import { Field, Button, TField } from "thyme";

import { AltButtons } from "../additions/AltButtons.component";

import { importStore } from "../../stores/import.store";

class ImportDataComponent extends MintComponent {
  constructor() {
    super();

    this.oninsert = function () {
      importStore.importValue = "";
      (async () => {
        await wait();
        this.importFormElement?.["importValue"]?.focus();
      })();
    };

    importStore.connect(this);
  }
}

export const ImportData = component(
  "div",
  ImportDataComponent,
  { class: "common-page" },
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
            mRef: "importFormElement",
          },
          [
            element<TField>(Field, {
              type: "textarea",
              name: "importValue",
              label: "Enter JSON data here",
              "[value]": "importValue",
              fieldStyles: styles({
                height: "12rem",
              }),
              "[onInput]": "onInput",
            }),
            element(Button, {
              type: "submit",
              theme: "apple",
              class: "button large padded",
              label: "Import data",
            }),
          ]
        ),
      ])
    ),
  ]
);
