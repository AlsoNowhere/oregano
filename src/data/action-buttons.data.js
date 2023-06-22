import { listStore } from "../stores/list.store";

import { Action } from "../models/Action.model";
import { ActionButton } from "../models/ActionButton.model";

export const actionButtons = [
  new ActionButton({ icon: "list", title: "Heatmap", id: "heatmap" }),
  new ActionButton(
    { icon: "sort-numeric-asc", title: "List add order", id: "list-order" },
    new Action("add-to-list", (currentItem, newItem) =>
      currentItem.items.unshift(newItem)
    )
  ),
  new ActionButton(
    {
      label: "a",
      icon: "level-down",
      title: "Large font size",
      id: "large-font",
    },
    new Action("style", "font-size: 2rem;")
  ),
  new ActionButton(
    { label: "B", title: "Bold font", id: "bold-font" },
    new Action("style", "font-weight: bold;")
  ),
  new ActionButton({ icon: "line-chart", title: "Has charts", id: "charts" }),
];
