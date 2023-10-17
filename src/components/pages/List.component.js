import { component, element, getter, template } from "mint";

import { Button } from "../common/Button.component";

import { MainButtons } from "../additions/MainButtons.component";
import { Breadcrumbs } from "../additions/Breadcrumbs.component";

import { getDate } from "../../services/get-date.service";

import { listStore } from "../../stores/list.store";
import { appStore } from "../../stores/app.store";

import { colours } from "../../data/colours.data";

const showOverflow = function () {
  const item = this.listElementRef.children[this._i];
  if (!item) return false;
  const [title] = item.getElementsByClassName("list-page__item-title");
  const [p] = item.getElementsByClassName("list-page__item-title-p");
  if (!p || p.offsetWidth === 0) return false;
  if (p.offsetWidth < title.offsetWidth) return false;
  return true;
};

export const List = component(
  "div",
  function () {
    listStore.connect(this);

    getter(this, "getTextColour", function () {
      const colour = colours.find(({ colour }) => colour === this.colour);
      return colour?.textColour || colours[0].colour;
    });

    getter(this, "hasLabel", function () {
      return this.label !== null;
    });

    getter(this, "hasIcon", function () {
      return this.icon !== null;
    });

    getter(this, "getIndex", function () {
      return this.__proto__._i;
    });

    getter(this, "createdDate", function () {
      if (
        this.createdAt === undefined &&
        (!(this.edits instanceof Array) || this.edits.length === 0)
      )
        return "";
      const time =
        this.edits instanceof Array && this.edits.length > 0
          ? this.edits.at(-1)
          : this.createdAt;
      const message =
        this.edits instanceof Array && this.edits.length > 0
          ? "Edited at"
          : "Created at";
      const { minutes, hours, day, month, year } = getDate(
        time + appStore.rootData.timestamp_root
      );
      return `${message}: ${day}-${month}-${year} ${hours}:${minutes}`;
    });

    getter(this, "showOverflow", showOverflow);

    getter(this, "showOverflowClass", function () {
      return showOverflow.apply(this) ? "overflows" : "";
    });

    getter(this, "messageIsToTheSide", () =>
      listStore.currentItem.actions.includes("message-to-side")
        ? "flex flex-nowrap"
        : ""
    );

    getter(this, "showItemsNumber", function () {
      return listStore.currentItem.items[this._i].actions.includes(
        "show-items-number"
      );
    });

    getter(this, "itemsCount", function () {
      return listStore.currentItem.items[this._i].items.length;
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

        element("div", { class: "flex space-between relative" }, [
          element("h2", { class: "page-title" }, "{currentTitle}"),

          element(
            "ul",
            { class: "list flex align-centre" },
            element(
              "li",
              {
                "m-for": "filteredActionButtons",
                "m-key": "id",
                class: "padding-left",
              },
              element("span", null, [
                element("span", { "m-if": "hasLabel" }, "{label}"),
                element("span", { "m-if": "hasIcon", class: "fa fa-{icon}" }),
              ])
            )
          ),
        ]),

        element("div", { "[class]": "messageIsToTheSide" }, [
          element("div", { class: "list-page__message" }, [
            element(
              "div",
              {
                "m-if": "!messageIsArray",
                style: "white-space: pre-wrap; {currentStyles}",
              },
              template("renderedMessage")
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
          ]),

          element(
            "ul",
            { class: "list list-page__list", "m-ref": "listElementRef" },
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
                    { class: "list-page__item-title {showOverflowClass}" },
                    [
                      element(
                        "span",
                        {
                          "m-if": "showOverflow",
                          class: "list-page__item-title-overflow",
                        },
                        "..."
                      ),
                      element(
                        "p",
                        { class: "list-page__item-title-p" },
                        "{title}"
                      ),
                    ]
                  ),
                  element("ul", { class: "list-page__item-options" }, [
                    element(
                      "li",
                      {
                        "m-if": "showItemsNumber",
                        class: "relative",
                      },
                      element(
                        "span",
                        {
                          class: "absolute middle blueberry-text bold",
                        },
                        "{itemsCount}"
                      )
                    ),

                    element(
                      "li",
                      {
                        "m-if": "hasMessage",
                        class: "relative width height",
                      },
                      element("span", {
                        class: "fa fa-list absolute middle blueberry-text",
                      })
                    ),

                    element(
                      "li",
                      {
                        "m-for": "itemActions",
                        "m-key": "_i",
                      },
                      element(Button, {
                        class: "empty square",
                        "[icon]": "icon",
                        "[itemIndex]": "getIndex",
                        "[onClick]": "action",
                      })
                    ),
                  ]),
                ]
              )
            )
          ),
        ]),
      ])
    ),
  ]
);
