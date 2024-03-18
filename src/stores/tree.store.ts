import { IStore, Resolver, Store } from "mint";

import { path } from "sage";

import { getItem } from "../services/get-item.service";

import { Item } from "../models/Item.model";

export const treeStore = new Store({
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
}) as IStore & {
  currentTitle: string;
  currentList: Array<Item>;
};
