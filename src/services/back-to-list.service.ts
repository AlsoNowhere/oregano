import { refresh } from "mint";

import { path } from "sage";
// import { path } from "./path.service";

import { appStore } from "../stores/app.store";
import { manageStore } from "../stores/manage.store";
import { listStore } from "../stores/list.store";

export const backToList = () => {
  manageStore.editItem = null;
  path.set(["list", ...listStore.depthIndexing]);
  refresh(appStore);
};
