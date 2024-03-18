import { component, element } from "mint";

import { Button } from "thyme";

export const ItemOptions = component(
  "ul",
  null,
  { class: "list-page__item-options" },
  [
    element(
      "li",
      {
        mIf: "showItemsNumber",
        class: "relative",
      },
      element(
        "span",
        {
          class:
            "padded-small abso-lute mid-dle blueberry-text snow-text-shadow bold",
        },
        "{itemsCount}"
      )
    ),

    element(
      "li",
      {
        mIf: "hasMessage",
        class: "relative width height",
      },
      element("span", {
        class: "fa fa-list absolute middle blueberry-text",
      })
    ),

    element(
      "li",
      {
        mFor: "itemActions",
        mKey: "_i",
      },
      element(Button, {
        theme: "empty",
        "[icon]": "icon",
        square: true,
        "[onClick]": "action",
        // "[itemIndex]": "getIndex",
        "[itemIndex]": "itemIndex",
      })
    ),
  ]
);
