import { Store } from "mint";

import { wait } from "../services/wait.service";
import { backToList } from "../services/back-to-list.service";
import { saveData } from "../services/load-save.service";

import { listStore } from "./list.store";
import { mainButtonsStore } from "./main-buttons.store";

import { Item } from "../models/Item.model";
import { appStore } from "./app.store";
import { UndoConfig } from "../models/UndoConfig.model";
import { path } from "../services/path.service";

export const manageStore = new Store({
  title: "",
  message: "",

  setTitle(_, element) {
    manageStore.title = element.value;
  },
  setMessage(_, element) {
    manageStore.message = element.value;
  },

  editItem: null,

  onSubmit(event) {
    event.preventDefault();
    const { title, message } = manageStore;
    if (manageStore.editItem !== null) {
      manageStore.editItem.title = title;
      manageStore.editItem.message = message;
      manageStore.editItem = null;
    } else {
      const newItem = new Item(title, message);
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

    //     const { title, message, itemColour: colour } = this;
    //     const newItem = { title, message, colour, list: this.editItem !== null ? this.editItem.list : [] };
    //     const oldItem = Object.assign({}, this.editItem);
    //     this.editItem !== null
    //         ? Object.assign(this.editItem, newItem)
    //         : this.currentList.push(newItem);
    //     {
    //         const { currentList, editItem, saveData, rootData } = this;
    //         undo.action = this.editItem !== null
    //             ? () => {
    //                 Object.assign(editItem, oldItem);
    //                 saveData(rootData);
    //             }
    //             : () => {
    //                 currentList.splice(currentList.indexOf(newItem), 1);
    //                 saveData(rootData);
    //             }
    //     }
    //     this.editItem = null;
    //     this.saveData(this.rootData);
    //     this.cancel();
    //     this.mainButtonsElement && (function(){
    //         let i = 0,
    //             l = this.mainButtonsElement.children.length;
    //         while (i < l) {
    //             const listItem = this.mainButtonsElement.children[i];
    //             const [button] = listItem.children;
    //             if (button.name === "Add") {
    //                 button.focus();
    //                 break;
    //             }
    //             i++;
    //         }
    //     }.apply(this));
  },

  cancel() {
    backToList();
  },
});
