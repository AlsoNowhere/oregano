import { component, element, getter } from "mint";

import { MainButtons } from "./structure/MainButtons.component";
import { Button } from "../../common/Button.component";

import { listStore } from "../../../stores/list.store";
import { Breadcrumbs } from "./structure/Breadcrumbs.component";

export const List = component(
  "div",
  function () {
    listStore.connect(this);

    getter(this, "items", () =>
      listStore.list.map(({ index, title, message }) => ({
        index,
        title,
        hasMessage: !!message,
      }))
    );
  },
  { class: "list-page" },
  [
    element(MainButtons),
    element(Breadcrumbs),
    element("h2", null, "{currentTitle}"),
    element("p", null, "{currentMessage}"),
    element(
      "ul",
      { class: "list list-page__container" },
      element(
        "li",
        {
          "m-for": "items",
          "m-key": "index",
          class: "list-page__item",
          "(click)": "selectItem",
        },
        element("div", { class: "list-page__item-container" }, [
          element(
            "div",
            { class: "list-page__item-title" },
            element("p", { class: "list-page__item-title-p" }, "{title}")
          ),
          element("ul", { class: "list-page__item-options" }, [
            element(
              "li",
              {
                "m-if": "hasMessage",
                class: "relative width height-large",
              },
              element("span", {
                class: "fa fa-list absolute middle blueberry-text",
              })
            ),
            element(
              "li",
              null,
              element(Button, {
                class: "empty square large",
                icon: "pencil",
                "[itemIndex]": "_i",
                "[onClick]": "editItem",
              })
            ),
            element(
              "li",
              null,
              element(Button, {
                class: "empty square large",
                icon: "scissors",
                "[itemIndex]": "_i",
                "[onClick]": "cutItem",
              })
            ),
            element(
              "li",
              null,
              element(Button, {
                class: "empty square large",
                icon: "trash-o",
                "[itemIndex]": "_i",
                "[onClick]": "deleteItem",
              })
            ),
          ]),
        ])
      )
    ),
  ]
);
