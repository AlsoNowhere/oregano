import { refresh } from "mint";

import { actionButtons } from "../data/action-buttons.data";
import { site } from "../data/site.data";

export const ActionButton = function ({ label, icon, title, id }, action) {
  this.label = label || null;
  this.icon = icon || null;
  this.title = title;
  this.action = action;
  this.onClick = function () {
    const actionButton = actionButtons.find(({ id }) => id === this.id);
    actionButton.active = !actionButton.active;
    actionButton.theme = actionButton.active ? "blueberry" : "snow";
    refresh(site.manageStore);
  };
  this.id = id;
  this.active = false;
  this.theme = "snow";
};
