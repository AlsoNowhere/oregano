import { refresh } from "mint";

import { path } from "./path.service";

import { listStore } from "../stores/list.store";

export const upOneLevel = () => {
  path.set(path.get().slice(0, path.get().length - 1));
  listStore.depthIndexing.pop();
  refresh(listStore);
};
