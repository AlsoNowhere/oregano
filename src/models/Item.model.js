import { appStore } from "../stores/app.store";

export const Item = function (title, message = "") {
  this.title = title;
  this.message = message;
  this.items = [];
  this.index = appStore.rootData.itemIndex++;
};
