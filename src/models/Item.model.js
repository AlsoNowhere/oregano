import { appStore } from "../stores/app.store";

export const Item = function (title, message = "", colour = colours[0].colour) {
  this.title = title;
  this.message = message;
  this.colour = colour;
  this.items = [];
  this.index = appStore.rootData.itemIndex++;
};
