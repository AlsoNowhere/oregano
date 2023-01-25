import { component, element } from "mint";

import { backToList } from "../../services/back-to-list.service";

export const AltButtons = component(
  "section",
  function () {
    this.backToList = backToList;
  },
  { class: "constrain centred padding-large" },
  element(
    "ul",
    { class: "list" },
    element(
      "li",
      null,
      element(
        "button",
        {
          type: "button",
          class: "button blueberry large square",
          "(click)": "backToList",
        },
        element("span", { class: "fa fa-arrow-left" })
      )
    )
  )
);
