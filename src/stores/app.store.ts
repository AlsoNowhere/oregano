import { IStore, Resolver, Store } from "mint";

import { path } from "sage";

import { Item } from "../models/Item.model";

import { IRootData } from "../interfaces/IRootData.interface";

export const appStore = new Store({
  rootData: null,
  currentItem: null,

  currentList: new Resolver(function () {
    return this.currentItem?.list;
  }),
  currentTitle: new Resolver(function () {
    return this.currentItem?.title;
  }),

  showList: new Resolver(function () {
    const [url] = path.get();
    return url === "list";
  }),

  showManage: new Resolver(function () {
    const [url] = path.get();
    return url === "manage";
  }),

  showExport: new Resolver(function () {
    const [url] = path.get();
    return url === "export";
  }),

  showImport: new Resolver(function () {
    const [url] = path.get();
    return url === "import";
  }),

  showTree: new Resolver(function () {
    const [url] = path.get();
    return url === "tree-view";
  }),

  showGraph: new Resolver(function () {
    const [url] = path.get();
    return url === "graph-view";
  }),

  showHeatmap: new Resolver(function () {
    const [url] = path.get();
    return url === "heat-map";
  }),

  showEditHeatmap: new Resolver(function () {
    const [url] = path.get();
    return url === "edit-heat-map";
  }),

  showSearch: new Resolver(function () {
    const [url] = path.get();
    return url === "search";
  }),
}) as IStore & {
  rootData: IRootData;
  currentItem: Item | null;

  currentList: Array<Item> | null;
  currentTitle: string | null;

  showList: boolean;
  showManage: boolean;
  showExport: boolean;
  showImport: boolean;
  showTree: boolean;
  showGraph: boolean;
  showHeatmap: boolean;
  showEditHeatmap: boolean;
  showSearch: boolean;
};
