import { refresh, span } from "mint";

import { path } from "sage";

import { upOneLevel } from "../services/up-one-level.service";
import { upToRoot } from "../services/up-to-root.service";
import { pasteItems } from "../services/paste-items.service";
import { saveToFile } from "../services/saveToFile.service";

import { appStore } from "../stores/app.store";
import { manageStore } from "../stores/manage.store";
import { listStore } from "../stores/list.store";

import { MainButton } from "../models/MainButton.model";

export const mainButtons = [
  new MainButton("Add", "Add item", "plus", "blueberry", function () {
    path.set(["manage", ...path.get().slice(1)]);
    listStore.depthIndexing = path.get().slice(1);
    refresh(appStore);
  }),
  new MainButton("Edit", "Edit this item", "pencil", "apple", function () {
    manageStore.editItem = listStore.currentItem;
    path.set(["manage", ...path.get().slice(1)]);
    refresh(appStore);
  }),
  new MainButton("Level up", "Up one level", "level-up", "snow", upOneLevel, {
    disabled: () => path.get().length === 1,
  }),
  new MainButton("Up to root", "Up to root", "home", "orange", upToRoot, {
    disabled: () => path.get().length === 1,
  }),

  new MainButton("Paste", "Paste items", "paint-brush", "orange", pasteItems, {
    disabled: () => {
      return appStore.rootData?.pasteItems.length === 0;
    },
    extraButtonLabel() {
      const length = appStore.rootData?.pasteItems.length;
      return span({ class: "bold" }, length + "" || "");
    },
  }),
  new MainButton(
    "Save",
    "Save data to file",
    "floppy-o",
    "blueberry",
    saveToFile
  ),
];
