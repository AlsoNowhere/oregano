import { Resolver, Store } from "mint";

import { backToList } from "../services/back-to-list.service";
import { getItem } from "../services/get-item.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";

import { Item } from "../models/Item.model";

const extractData = (object) => {
  const obj = new Item();
  const { title, message, items, colour, textColour } = object;
  title && (obj.title = title);
  message && (obj.message = message);
  items && (obj.items = items.map(extractData));
  colour && (obj.colour = colour);
  textColour && (obj.textColour = textColour);
  return obj;
};

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
      const currentItem = getItem(path.get().slice(1));
      const obj = extractData(data);
      currentItem.items.push(obj);
      saveData();
      backToList();
    } catch (error) {
      console.error(error);
    }
  },
});
