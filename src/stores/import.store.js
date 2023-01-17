import { Resolver, Store } from "mint";

import { backToList } from "../services/back-to-list.service";
import { getItem } from "../services/get-item.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";

import { appStore } from "./app.store";

// const getItem = (url, item = appStore.rootData) => {
//   if (item === null) return null;
//   if (url.length === 0) return item;
//   const nextIndex = url.at(0);
//   if (nextIndex === "" || nextIndex === undefined) return item;
//   const nextItem = item.items[nextIndex];
//   return getItem(url.slice(1), nextItem);
// };

export const importStore = new Store({
  importValue: "",

  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  onInput(_, element) {
    importStore.importValue = element.value;
  },

  onSubmit(event) {
    event.preventDefault();
    try {
      const data = JSON.parse(importStore.importValue);
      const item = getItem(path.get().slice(1));
      item.items.push(data);
      saveData();
      backToList();
    } catch (error) {
      console.error(error);
    }
  },
});
