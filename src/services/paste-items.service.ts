import { refresh } from "mint";

import { path } from "sage";

import { saveData } from "../logic/load-save.logic";

import { appStore } from "../stores/app.store";
import { listStore } from "../stores/list.store";

import { UndoConfig } from "../models/UndoConfig.model";

import { UndoConfigs } from "../enums/undo-configs.enum";

export const pasteItems = () => {
  const { pasteItems } = appStore.rootData;
  listStore.list.push(...pasteItems);
  appStore.rootData.undoItems.unshift(
    new UndoConfig(UndoConfigs.paste, {
      items: [...pasteItems],
      path: path.get().slice(1),
    })
  );
  if (appStore.rootData.undoItems.length > 1) appStore.rootData.undoItems.pop();
  appStore.rootData.pasteItems.length = 0;
  saveData();
  refresh(listStore);
};
