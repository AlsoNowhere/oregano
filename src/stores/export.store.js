import { Resolver, Store } from "mint";

import { getItem } from "../services/get-item.service";
import { path } from "../services/path.service";

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
