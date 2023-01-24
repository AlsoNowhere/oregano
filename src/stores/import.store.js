import { Resolver, Store } from "mint";

import { backToList } from "../services/back-to-list.service";
import { getItem } from "../services/get-item.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";

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
