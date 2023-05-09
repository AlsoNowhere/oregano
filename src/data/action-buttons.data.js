import { listStore } from "../stores/list.store";

import { Action } from "../models/Action.model";
import { ActionButton } from "../models/ActionButton.model";

export const actionButtons = [
  new ActionButton(
    { icon: "list", title: "Heatmap", id: "heatmap" },
    new Action("heatmap", "heatmap", (currentItem, newItem) =>
      currentItem.items.unshift(newItem)
    )
  ),
  new ActionButton(
    { icon: "sort-numeric-asc", title: "List add order", id: "list-order" },
    new Action("add-to-list", "list-order", (currentItem, newItem) =>
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
    new Action("style", "large-font", "font-size: 2rem;")
  ),
  new ActionButton(
    { label: "B", title: "Bold font", id: "bold-font" },
    new Action("style", "bold-font", "font-weight: bold;")
  ),
  new ActionButton(
    { icon: "line-chart", title: "Has charts", id: "charts" },
    // add-to-list
    new Action("add-to-list", "has-chart", (_, newItem) => {
      listStore.list.push(newItem);
    })
  ),
];
