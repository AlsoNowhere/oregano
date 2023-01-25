import { Resolver, Store } from "mint";

import { wait } from "../services/wait.service";
import { backToList } from "../services/back-to-list.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";

import { listStore } from "./list.store";
import { mainButtonsStore } from "./main-buttons.store";
import { appStore } from "./app.store";

import { Item } from "../models/Item.model";
import { UndoConfig } from "../models/UndoConfig.model";

import { colours } from "../data/colours.data";

const colour = colours[0].colour;

export const manageStore = new Store({
  title: "",
  message: "",
  colours,
  currentColour: colour,

  setTitle(_, element) {
    manageStore.title = element.value;
  },
  setMessage(_, element) {
    manageStore.message = element.value;
  },
  setColour(_, element) {
    manageStore.currentColour = element.value;
  },

  isChecked: new Resolver(function () {
    return false;
  }),

  editItem: null,

  onSubmit(event) {
    event.preventDefault();
    const { title, message, currentColour } = manageStore;
    if (manageStore.editItem !== null) {
      manageStore.editItem.title = title;
      manageStore.editItem.message = message;
      manageStore.editItem.colour = currentColour;
      manageStore.editItem = null;
    } else {
      const newItem = new Item(title, message, currentColour);
      listStore.list.push(newItem);
      appStore.rootData.undoItems.unshift(
        new UndoConfig("add", { item: newItem, path: path.get().slice(1) })
      );
      if (appStore.rootData.undoItems.length > 1)
        appStore.rootData.undoItems = appStore.rootData.undoItems.slice(0, 1);
    }
    saveData();
    backToList();
    (async () => {
      await wait();
      const [first] = mainButtonsStore.mainButtonsElement.children;
      const [button] = first.children;
      button?.focus?.();
    })();
  },

  cancel() {
    backToList();
  },
});
