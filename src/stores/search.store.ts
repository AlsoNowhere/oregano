import { IStore, MintEvent, Resolver, Store, refresh } from "mint";

import { path, wait } from "sage";

import { getItem } from "../services/get-item.service";
import { searchItems } from "../services/search-items.service";

import { appStore } from "./app.store";

const update: MintEvent<HTMLInputElement> = (_, element) => {
  searchStore.value = element.value;
};

const runSearch: MintEvent = (event) => {
  event.preventDefault();
  const { value } = searchStore;
  if (value === "") {
    searchStore.value = "";
    searchStore.results = [];
    refresh(appStore);
    return;
  }
  const { items } = getItem(path.get().slice(1));
  const results = searchItems(items, value);
  searchStore.results = results;
  refresh(appStore);
};

const selectRoute = function () {
  path.set(["list", ...path.get().slice(1), ...this.route]);
  searchStore.value = "";
  searchStore.results = [];
  refresh(appStore);
};

export const searchStore = new Store({
  value: "",
  results: [],
  formElementRef: null,

  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  update,

  runSearch,

  selectRoute,

  oninsert: async function () {
    searchStore.value = "";
    searchStore.results = [];
    await wait();
    searchStore.formElementRef?.search?.focus();
  },
}) as IStore & {
  value: string;
  results: Array<{}>;
  formElementRef: HTMLFormElement;
};
