import { Action } from "../models/Action.model";
import { ActionButton } from "../models/ActionButton.model";

import { site } from "./site.data";

export const actionButtons = [
  new ActionButton(
    { icon: "list", title: "Heatmap", id: "heatmap" },
    new Action("init", (item) => {
      item.heatmap = {};
    })
  ),
  new ActionButton(
    { icon: "sort-numeric-asc", title: "List add order", id: "list-order" },
    new Action("add-to-list", (currentItem, newItem) =>
      currentItem.items.unshift(newItem)
    )
  ),
  new ActionButton(
    {
      label: "a",
      icon: "level-up",
      title: "Large font size",
      id: "large-font",
    },
    new Action("style", "font-size: 1.5rem;")
  ),
  new ActionButton(
    { label: "B", title: "Bold font", id: "bold-font" },
    new Action("style", "font-weight: bold;")
  ),
  new ActionButton({
    icon: "line-chart",
    title: "Has charts",
    id: "charts",
  }),
  new ActionButton({
    icon: "clone",
    title: "Message to side",
    id: "message-to-side",
  }),
  new ActionButton({
    icon: "circle-o-notch",
    title: "Show items number",
    id: "show-items-number",
  }),
];

site.actionButtons = actionButtons;
