import { refresh } from "mint";

import { path } from "./path.service";

import { listStore } from "../stores/list.store";

export const upToRoot = () => {
  path.set(path.get().slice(0, 1));
  listStore.depthIndexing = [];
  refresh(listStore);
};
