import { refresh } from "mint";

import { path } from "../services/path.service";
import { undo } from "../services/undo.service";

import { appStore } from "../stores/app.store";
import { listStore } from "../stores/list.store";

import { MainButton } from "../models/MainButton.model";

export const secondaryButtons = [
  new MainButton("Undo", "Undo", "undo", "snow", undo, {
    disabled: () => appStore.rootData?.undoItems.length === 0,
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
  new MainButton("Search", "Search", "search", "blueberry", () => {
    path.set(["search", ...path.get().slice(1)]);
    refresh(appStore);
  }),
  new MainButton(
    "Graph",
    "Graph view",
    "line-chart",
    "snow",
    () => {
      path.set(["graph-view", ...path.get().slice(1)]);
      refresh(appStore);
    },
    {
      condition() {
        return listStore.currentItem.actions?.includes("charts");
      },
    }
  ),
  new MainButton(
    "Heatmap",
    "Heat map",
    "square-o",
    "snow",
    () => {
      path.set(["heat-map", ...path.get().slice(1)]);
      refresh(appStore);
    },
    {
      condition() {
        return listStore.currentItem.actions?.includes("heatmap");
      },
    }
  ),
];
