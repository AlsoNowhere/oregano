import { appStore } from "../stores/app.store";

export const getItem = (url, item = appStore.rootData) => {
  if (item === null) return null;
  if (url.length === 0) return item;
  const nextIndex = url.at(0);
  if (nextIndex === "" || nextIndex === undefined) return item;
  const nextItem = item.items[nextIndex];
  return getItem(url.slice(1), nextItem);
};
