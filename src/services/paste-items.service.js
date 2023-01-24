import { refresh } from "mint";

import { saveData } from "./load-save.service";
import { path } from "./path.service";

import { appStore } from "../stores/app.store";
import { listStore } from "../stores/list.store";

import { UndoConfig } from "../models/UndoConfig.model";

export const pasteItems = () => {
  const { pasteItems } = appStore.rootData;
  listStore.list.push(...pasteItems);
  appStore.rootData.undoItems.unshift(
    new UndoConfig("paste", {
      items: [...pasteItems],
      path: path.get().slice(1),
    })
  );
  if (appStore.rootData.undoItems.length > 1) appStore.rootData.undoItems.pop();
  appStore.rootData.pasteItems.length = 0;
  saveData();
  refresh(listStore);
};
