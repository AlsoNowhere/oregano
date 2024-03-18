import { refresh } from "mint";

import { getItem } from "./get-item.service";
import { saveData } from "../logic/load-save.logic";

import { appStore } from "../stores/app.store";
import { listStore } from "../stores/list.store";

import { UndoConfigs } from "../enums/undo-configs.enum";

export const undo = () => {
  const [undoItem] = appStore.rootData.undoItems;
  appStore.rootData.undoItems.shift();
  if (undoItem.type === UndoConfigs.add) {
    (function () {
      const pathItem = getItem(undoItem.path);
      if (pathItem === undefined) return;
      const index = pathItem.items.findIndex(
        (x) => x.index === undoItem.item.index
      );
      if (index === -1) return;
      pathItem.items.splice(index, 1);
    })();
  }
  if (undoItem.type === UndoConfigs.cut) {
    const pathItem = getItem(undoItem.path);
    if (pathItem === undefined) return;
    pathItem.items.push(undoItem.item);
    const pasteIndex = appStore.rootData.pasteItems.findIndex(
      (x) => x.index === undoItem.item.index
    );
    if (pasteIndex !== -1) {
      appStore.rootData.pasteItems.splice(pasteIndex, 1);
    }
  }
  if (undoItem.type === UndoConfigs.delete) {
    const pathItem = getItem(undoItem.path);
    if (pathItem === undefined) return;
    pathItem.items.push(undoItem.item);
  }
  if (undoItem.type === UndoConfigs.paste) {
    const pathItem = getItem(undoItem.path);
    if (pathItem === undefined) return;
    undoItem.items.forEach(({ index }) => {
      const undoIndex = pathItem.items.findIndex((x) => x.index === index);
      if (undoIndex === -1) return;
      pathItem.items.splice(undoIndex, 1);
    });
  }
  saveData();
  refresh(listStore);
};
