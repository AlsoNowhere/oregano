import { IStore, Resolver, Store } from "mint";

import { path, wait } from "sage";

import { getItem } from "../services/get-item.service";

export const exportStore = new Store({
  currentTitle: new Resolver<string>(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  currentValue: new Resolver<string>(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return JSON.stringify(item);
  }),

  formElementRef: null,

  oninsert: async () => {
    const form = exportStore.formElementRef;
    await wait();
    const input = form["export-data"];
    input.select();
  },
}) as IStore & {
  currentTitle: string;
  currentValue: string;
  formElementRef: HTMLFormElement;
};
