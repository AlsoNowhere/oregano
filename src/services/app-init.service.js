import { refresh } from "mint";

import { wait } from "./wait.service";
import { path } from "./path.service";
import { loadData } from "./load-save.service";

import { appStore } from "../stores/app.store";

export const appInit = async () => {
  const [url] = path.get();
  if (url === undefined) {
    path.set(["list"]);
  }
  loadData();
  await wait();
  refresh(appStore);
  window.dispatchEvent(
    new CustomEvent("initial-data-save", { detail: appStore.rootData })
  );
};
