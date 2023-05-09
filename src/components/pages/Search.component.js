import { component, element } from "mint";

import { AltButtons } from "../additions/AltButtons.component";
import { Field } from "../common/Field.component";
import { Button } from "../common/Button.component";

import { wait } from "../../services/wait.service";

import { searchStore } from "../../stores/search.store";

export const Search = component(
  "div",
  function SearchComponent() {
    searchStore.connect(this);

    this.oninsert = async function () {
      searchStore.value = "";
      searchStore.results = [];
      await wait();
      this.formElementRef?.search?.focus();
    };
  },
  null,
  [
    element(AltButtons),
    element(
      "div",
      {
        class: "other-content",
      },
      element("section", { class: "other-content__container" }, [
        element("h2", null, "{currentTitle}"),

        element(
          "form",
          {
            class: "flex",
            "(submit)": "runSearch",
            autocomplete: "off",
            "m-ref": "formElementRef",
          },
          [
            element(Field, {
              name: "search",
              placeholder: "Search ...",
              wrapperClasses: "flex-grow",
              "[value]": "value",
              "[onInput]": "update",
            }),
            element(Button, {
              type: "submit",
              icon: "search",
              class: "square",
            }),
          ]
        ),

        element(
          "ul",
          { class: "list" },
          element(
            "li",
            {
              "m-for": "results",
              "m-key": "_i",
              class: "card pointer hover",
              "(click)": "selectRoute",
            },
            "{title}"
          )
        ),
      ])
    ),
  ]
);
