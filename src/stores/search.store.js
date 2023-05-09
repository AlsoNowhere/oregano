import { Resolver, Store, refresh } from "mint";

import { getItem } from "../services/get-item.service";
import { path } from "../services/path.service";
import { searchItems } from "../services/search-items.service";

import { appStore } from "./app.store";

export const searchStore = new Store({
  value: "",
  results: [],
  formElementRef: null,

  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  update(_, element) {
    searchStore.value = element.value;
  },
  runSearch(event) {
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
  },
  selectRoute() {
    path.set(["list", ...path.get().slice(1), ...this.route]);
    searchStore.value = "";
    searchStore.results = [];
    refresh(appStore);
  },
});
