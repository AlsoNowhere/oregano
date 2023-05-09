import { refresh } from "mint";

import { wait } from "./wait.service";
import { path } from "./path.service";
import { loadData } from "./load-save.service";
import { backToList } from "./back-to-list.service";

import { appStore } from "../stores/app.store";

export const appInit = async () => {
  const [url] = path.get();
  if (url === undefined) {
    path.set(["list"]);
  }
  loadData();
  await wait();
  refresh(appStore);

  // This communicates to node on Electron app, does nothing silently on Browser.
  window.dispatchEvent(
    new CustomEvent("initial-data-save", { detail: appStore.rootData })
  );

  // When pressing the Esc key on Manage form, return to list page.
  window.addEventListener("keydown", (event) => {
    if (event.code !== "Escape") return;
    if (path.get()[0] === "manage") {
      backToList();
    }
  });
};
