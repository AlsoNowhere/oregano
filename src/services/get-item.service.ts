import { appStore } from "../stores/app.store";

import { Item } from "../models/Item.model";

import { IData } from "../interfaces/IData.interface";

export const getItem = (
  url: Array<string>,
  item = appStore.rootData
): Item | null => {
  if (item === null) return null;
  if (url.length === 0) return item as IData;
  const nextIndex = url.at(0);
  if (nextIndex === "" || nextIndex === undefined) return item;
  const nextItem = item.items[nextIndex];
  return getItem(url.slice(1), nextItem);
};
