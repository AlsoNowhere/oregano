import { Resolver, Store, refresh } from "mint";

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
import { actionButtons } from "../data/action-buttons.data";

const colour = colours[0].colour;

export const manageStore = new Store({
  title: "",
  message: "",
  colours,
  currentColour: colour,
  actionButtons,

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
    let _message = message;
    const messages = message.split("\n==b\n");
    if (messages.length > 1) {
      _message = messages;
    }
    if (manageStore.editItem !== null) {
      const actions = actionButtons.reduce(
        (a, b) => (b.active && a.push(b.action.id), a),
        []
      );
      manageStore.editItem.title = title;
      manageStore.editItem.message = _message;
      manageStore.editItem.colour = currentColour;
      manageStore.editItem.actions = actions;
      manageStore.editItem = null;
    } else {
      const actions = actionButtons.reduce(
        (a, b) => (b.active && a.push(b.action.id), a),
        []
      );
      const newItem = new Item(title, _message, currentColour, actions);

      {
        const actions = (listStore.currentItem.actions || [])
          .map(
            (x) => actionButtons.find(({ action: { id } }) => x === id).action
          )
          .filter(({ type }) => type === "add-to-list");

        if (actions.length === 0) {
          listStore.list.push(newItem);
        } else {
          actions.forEach(({ value }) => value(listStore.currentItem, newItem));
        }
      }

      appStore.rootData.undoItems.unshift(
        new UndoConfig("add", { item: newItem, path: path.get().slice(1) })
      );
      if (appStore.rootData.undoItems.length > 1)
        appStore.rootData.undoItems = appStore.rootData.undoItems.slice(0, 1);
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
