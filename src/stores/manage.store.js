import { Resolver, Store } from "mint";

import { wait } from "../services/wait.service";
import { backToList } from "../services/back-to-list.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";
import { getActionAbles, getActions } from "../services/get-actions.service";
import { getTime } from "../services/get-time.service";

import { listStore } from "./list.store";
import { mainButtonsStore } from "./main-buttons.store";
import { appStore } from "./app.store";

import { Item } from "../models/Item.model";
import { UndoConfig } from "../models/UndoConfig.model";

import { colours } from "../data/colours.data";
import { site } from "../data/site.data";

const colour = colours[0].colour;

export const manageStore = new Store({
  title: "",
  message: "",
  colours,
  currentColour: colour,
  actionButtons: new Resolver(() => site.actionButtons),

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
    const { title, currentColour } = manageStore;
    const message = (() => {
      const { message } = manageStore;
      const messages = message.split("\n==b\n");
      return messages.length > 1 ? messages : message;
    })();
    const actions = getActions();

    if (manageStore.editItem === null) {
      // Create
      const newItem = new Item(title, message, currentColour, actions);
      const [action] = getActionAbles(
        listStore.currentItem.actions || [],
        "add-to-list"
      );
      if (!!action) {
        action(listStore.currentItem, newItem);
      } else {
        listStore.list.push(newItem);
      }
      appStore.rootData.undoItems = [
        new UndoConfig("add", { item: newItem, path: path.get().slice(1) }),
      ];
      getActionAbles(actions || [], "init").forEach((x) => x(newItem));
    } else {
      // Edit
      manageStore.editItem.title = title;
      manageStore.editItem.message = message;
      manageStore.editItem.colour = currentColour;
      manageStore.editItem.actions = actions;
      if (!(manageStore.editItem.edits instanceof Array))
        manageStore.editItem.edits = [];
      manageStore.editItem.edits.push(getTime());
      manageStore.editItem = null;
    }

    saveData();
    listStore.depthIndexing = path.get().slice(1);
    backToList();
    (async () => {
      await wait();
      const [first] = mainButtonsStore.mainButtonsElement.children;
      const [button] = first.children;
      button?.focus?.();
    })();
  },

  cancel() {
    listStore.depthIndexing = path.get().slice(1);
    backToList();
  },
});

site.manageStore = manageStore;
