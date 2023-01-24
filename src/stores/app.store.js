import { Resolver, Store } from "mint";

import { path } from "../services/path.service";

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
});