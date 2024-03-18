import { IStore, MintEvent, Resolver, Store } from "mint";

import { path, toast } from "sage";

import { backToList } from "../services/back-to-list.service";
import { getItem } from "../services/get-item.service";
import { saveData } from "../logic/load-save.logic";

import { Item } from "../models/Item.model";

import { IData } from "../interfaces/IData.interface";

const extractData = (object) => {
  const obj = new Item();
  const { title, message, items, colour, textColour } = object;
  // ** Be specific about properties to catch errors.
  title && (obj.title = title);
  message && (obj.message = message);
  items && (obj.items = items.map(extractData));
  colour && (obj.colour = colour);
  // textColour && (obj.textColour = textColour);
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
    if (importStore.importValue === "") {
      toast("No data input", "orange");
      return;
    }
    try {
      const data: IData = JSON.parse(importStore.importValue);
      const currentItem = getItem(path.get().slice(1));
      const obj = extractData(data);
      currentItem.items.push(obj);
      saveData();
      backToList();
    } catch (error) {
      console.error(error);
      toast("Could not parse this data", "tomato");
    }
  },
}) as IStore & {
  importValue: string;
  currentTitle: string;
  onInput: MintEvent;
  onSubmit: MintEvent<HTMLFormElement>;
};
