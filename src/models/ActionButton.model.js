import { refresh } from "mint";

import { manageStore } from "../stores/manage.store";

import { actionButtons } from "../data/action-buttons.data";

export const ActionButton = function ({ label, icon, title, id }, action) {
  this.label = label || null;
  this.icon = icon || null;
  this.title = title;
  this.action = action;
  this.onClick = function () {
    const actionButton = actionButtons.find(({ id }) => id === this.id);
    actionButton.active = !actionButton.active;
    actionButton.theme = actionButton.active ? "blueberry" : "snow";
    refresh(manageStore);
  };
  this.id = id;
  this.active = false;
  this.theme = "snow";
};
