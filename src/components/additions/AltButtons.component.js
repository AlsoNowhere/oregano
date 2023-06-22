import { component, element, refresh } from "mint";

import { backToList } from "../../services/back-to-list.service";
import { path } from "../../services/path.service";

import { listStore } from "../../stores/list.store";
import { appStore } from "../../stores/app.store";

export const AltButtons = component(
  "section",
  function () {
    this.type = "normal";

    this.backToList = () => {
      if (this.type === "normal") {
        listStore.depthIndexing = path.get().slice(1);
        backToList();
      } else {
        path.set([this.type, ...path.get().slice(1, -1)]);
        refresh(appStore);
      }
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
