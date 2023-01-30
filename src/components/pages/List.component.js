import { component, element, getter, refresh } from "mint";

import { Button } from "../common/Button.component";

import { MainButtons } from "../additions/MainButtons.component";
import { Breadcrumbs } from "../additions/Breadcrumbs.component";

import { listStore } from "../../stores/list.store";

import { colours } from "../../data/colours.data";

export const List = component(
  "div",
  function () {
    listStore.connect(this);

    getter(this, "messageIsArray", function () {
      return listStore.currentMessage instanceof Array;
    });

    getter(this, "getTextColour", function () {
      const colour = colours.find(({ colour }) => colour === this.colour);
      return colour?.textColour || colours[0].colour;
    });
  },
  { class: "list-page" },
  [
    element(MainButtons),
    element(
      "div",
      { class: "list-page__container" },
      element("div", { class: "list-page__container-items" }, [
        element(Breadcrumbs),
        element("h2", null, "{currentTitle}"),
        element(
          "p",
          {
            "m-if": "!messageIsArray",
            style: "white-space: pre-wrap; {currentStyles}",
          },
          "{currentMessage}"
        ),
        element(
          "ul",
          { "m-if": "messageIsArray", class: "flex list" },
          element(
            "li",
            {
              "m-for": "currentMessage",
              "m-key": "_x",
              class: "padded",
              style: "white-space: pre-wrap;",
            },
            "{_x}"
          )
        ),
        element(
          "ul",
          { class: "list list-page__list" },
          element(
            "li",
            {
              "m-for": "items",
              "m-key": "index",
              class: "list-page__item",
              "(click)": "selectItem",
              draggable: "true",
              "(dragstart)": "onDragStart",
              "(dragover)": "onDragOver",
              "(drop)": "onDrop",
            },
            element(
              "div",
              {
                class: "list-page__item-container",
                style: "background-color: {colour}; color: {getTextColour};",
              },
              [
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
              ]
            )
          )
        ),
      ])
    ),
  ]
);
