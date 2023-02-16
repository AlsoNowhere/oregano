import { Resolver, Store } from "mint";

import { getItem } from "../services/get-item.service";
import { path } from "../services/path.service";

export const graphStore = new Store({
  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  currentList: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return [];
    return item.items;
  }),
});
