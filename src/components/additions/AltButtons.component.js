import { component, element } from "mint";

import { backToList } from "../../services/back-to-list.service";
import { path } from "../../services/path.service";

import { listStore } from "../../stores/list.store";

export const AltButtons = component(
  "section",
  function () {
    this.backToList = () => {
      listStore.depthIndexing = path.get().slice(1);
      backToList();
    };
  },
  { class: "alt-buttons" },
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
