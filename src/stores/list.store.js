import { Resolver, Store, refresh } from "mint";

import { getItem } from "../services/get-item.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";

import { appStore } from "./app.store";
import { manageStore } from "./manage.store";

import { UndoConfig } from "../models/UndoConfig.model";

// const getItem = (url, item = appStore.rootData) => {
//   if (item === null) return null;
//   if (url.length === 0) return item;
//   const nextIndex = url.at(0);
//   if (nextIndex === "" || nextIndex === undefined) return item;
//   const nextItem = item.items[nextIndex];
//   return getItem(url.slice(1), nextItem);
// };

export const listStore = new Store({
  depthIndexing: [],

  currentItem: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item;
  }),

  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  currentMessage: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.message;
  }),

  list: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return [];
    return item.items;
  }),

  selectItem() {
    const nextIndex = this._i + "";
    path.set([...path.get(), nextIndex]);
    listStore.depthIndexing.push(nextIndex);
    refresh(listStore);
  },

  editItem(event) {
    event.stopPropagation();
    manageStore.editItem = listStore.list[this.itemIndex];
    path.set(["manage", ...path.get().slice(1)]);
    refresh(appStore);
  },

  cutItem(event) {
    event.stopPropagation();
    const item = listStore.list[this.itemIndex];
    appStore.rootData.pasteItems.push(item);
    listStore.list.splice(this.itemIndex, 1);
    appStore.rootData.undoItems.unshift(
      new UndoConfig("cut", { item, path: path.get().slice(1) })
    );
    if (appStore.rootData.undoItems.length > 1)
      appStore.rootData.undoItems.pop();
    saveData();
    refresh(listStore);
  },

  deleteItem(event) {
    event.stopPropagation();
    const item = listStore.list[this.itemIndex];
    listStore.list.splice(this.itemIndex, 1);
    appStore.rootData.undoItems.unshift(
      new UndoConfig("delete", { item, path: path.get().slice(1) })
    );
    if (appStore.rootData.undoItems.length > 1)
      appStore.rootData.undoItems.pop();
    saveData();
    refresh(listStore);
  },
});
