import { MintComponent, component, element, refresh } from "mint";

import { path } from "sage";

import { backToList } from "../../services/back-to-list.service";

import { listStore } from "../../stores/list.store";
import { appStore } from "../../stores/app.store";

class AltButtonsComponent extends MintComponent {
  type: "normal" | "edit-heat-map";
  backToList: () => void;

  constructor() {
    super();

    this.type = "normal";

    this.backToList = () => {
      if (this.type === "normal") {
        listStore.depthIndexing = path.get().slice(1);
        backToList();
      } else if (this.type === "edit-heat-map") {
        path.set(["heat-map", ...path.get().slice(1, -1)]);
        refresh(appStore);
      } else {
        path.set([this.type, ...path.get().slice(1, -1)]);
        refresh(appStore);
      }
    };
  }
}

export const AltButtons = component(
  "section",
  AltButtonsComponent,
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
