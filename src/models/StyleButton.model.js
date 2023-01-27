import { refresh } from "mint";

import { manageStore } from "../stores/manage.store";

import { styleButtons } from "../data/style-buttons.data";

let id = 0;

export const StyleButton = function ({ label, icon }, style) {
  this.label = label || null;
  this.icon = icon || null;
  this.style = style;
  this.onClick = function () {
    const styleButton = styleButtons.find(({ id }) => id === this.id);
    styleButton.active = !styleButton.active;
    styleButton.theme = styleButton.active ? "blueberry" : "snow";
    refresh(manageStore);
  };
  this.id = ++id;
  this.active = false;
  this.theme = "snow";
};
