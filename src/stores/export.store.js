import { Resolver, Store } from "mint";
import { getItem } from "../services/get-item.service";

import { path } from "../services/path.service";

import { appStore } from "./app.store";

// const getItem = (url, item = appStore.rootData) => {
//   if (item === null) return null;
//   if (url.length === 0) return item;
//   const nextIndex = url.at(0);
//   if (nextIndex === "" || nextIndex === undefined) return item;
//   const nextItem = item.items[nextIndex];
//   return getItem(url.slice(1), nextItem);
// };

export const exportStore = new Store({
  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  currentValue: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return JSON.stringify(item);
  }),
});
