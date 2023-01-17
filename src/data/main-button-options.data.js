import { app, refresh } from "mint";

import { path } from "../services/path.service";
import { upOneLevel } from "../services/up-one-level.service";

import { appStore } from "../stores/app.store";

import { MainButton } from "../models/MainButton.model";
import { upToRoot } from "../services/up-to-root.service";
import { pasteItems } from "../services/paste-items.service";
import { undo } from "../services/undo.service";

// import { upToRoot } from "../services/main-buttons/up-to-root.service";
// import { pasteItems } from "../services/main-buttons/paste-items.service";

// import { undo } from "./undo-list.data";
// import { dill } from "dill-framework";

export const mainButtons = [
  new MainButton("Add", "Add item", "plus", "blueberry", function () {
    path.set(["manage", ...path.get().slice(1)]);
    // setTimeout(() => {
    //     this.manageFormElement?.title.focus();
    // }, 0);
    refresh(appStore);
  }),
  // new MainButton("Edit this item", "Edit this item", "pencil", "apple", function(){
  //     this.editItem = this.currentItem;
  //     path.path = ["manage", ...path.path.slice(1)];
  //     setTimeout(() => {
  //         this.manageFormElement?.title.focus();
  //     }, 0);
  // }),
  new MainButton("Undo", "Undo", "undo", "snow", undo, {
    disabled: () => appStore.rootData?.undoItems.length === 0,
  }),
  new MainButton("Level up", "Up one level", "level-up", "snow", upOneLevel, {
    disabled: () => path.get().length === 1,
  }),
  new MainButton("Up to root", "Up to root", "home", "orange", upToRoot, {
    disabled: () => path.get().length === 1,
  }),
  new MainButton("Export", "Export", "upload", "apple", () => {
    path.set(["export", ...path.get().slice(1)]);
    refresh(appStore);
  }),
  new MainButton("Import", "Import", "download", "snow", () => {
    path.set(["import", ...path.get().slice(1)]);
    refresh(appStore);
  }),
  new MainButton("Tree", "Tree view", "list", "snow", () => {
    path.set(["tree-view", ...path.get().slice(1)]);
    refresh(appStore);
  }),
  new MainButton("Paste", "Paste items", "paint-brush", "orange", pasteItems, {
    disabled: () => {
      return appStore.rootData?.pasteItems.length === 0;
    },
    extraButtonLabel() {
      const length = appStore.rootData?.pasteItems.length;
      return length || "";
    },
  }),
];
