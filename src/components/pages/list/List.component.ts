import { MintComponent, component, element } from "mint";

import { MainButtons } from "../../additions/MainButtons.component";
import { Breadcrumbs } from "../../additions/Breadcrumbs.component";
import { ItemOptions } from "./ItemOptions.component";
import { ListTitle } from "./ListTitle.component";
import { Message } from "./Message.component";
import { Title } from "./Title.component";

import { listStore } from "../../../stores/list.store";

class ListComponent extends MintComponent {
  constructor() {
    super();

    listStore.connect(this);
  }
}

export const List = component("div", ListComponent, { class: "list-page" }, [
  element(MainButtons),

  element(
    "div",
    { class: "list-page__container" },
    element("div", { class: "list-page__container-items" }, [
      element(Breadcrumbs),

      element(Title, {
        "[currentTitle]": "currentTitle",
        "[filteredActionButtons]": "filteredActionButtons",
        "[hasIcon]": "hasIcon",
      }),

      element("div", { "[class]": "messageIsToTheSide" }, [
        element(Message, {
          "[messageIsArray]": "messageIsArray",
          "[currentStyles]": "currentStyles",
          "[renderedMessage]": "renderedMessage",
          "[currentMessage]": "currentMessage",
          "[changeCheckbox]": "changeCheckbox",
        }),

        element(
          "ul",
          { class: "list list-page__list", mRef: "listElementRef" },
          element(
            "li",
            {
              mFor: "items",
              mKey: "index",
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
                element(ListTitle, {
                  "[showOverflowClass]": "showOverflowClass",
                  "[showOverflow]": "showOverflow",
                  "[title]": "title",
                  "[listElementRef]": "listElementRef",
                  "[itemIndex]": "_i",
                }),
                element(ItemOptions, {
                  "[showItemsNumber]": "showItemsNumber",
                  "[itemsCount]": "itemsCount",
                  "[hasMessage]": "hasMessage",
                  "[itemActions]": "itemActions",
                  "[getIndex]": "getIndex",
                  "[itemIndex]": "_i",
                }),
              ]
            )
          )
        ),
      ]),
    ])
  ),
]);
