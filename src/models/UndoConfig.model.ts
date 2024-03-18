import { Item } from "./Item.model";

import { UndoConfigs } from "../enums/undo-configs.enum";

// { item: Item; path: Array<string>; items: Array<Item> }

type options =
  | {
      item: Item;
      path: Array<string>;
      items?: never;
    }
  | {
      item?: never;
      path: Array<string>;
      items: Array<Item>;
    };

export class UndoConfig {
  type: UndoConfigs;
  item: Item;
  path: Array<string>;
  items: Array<Item>;

  constructor(type: UndoConfigs, { item, path, items }: options) {
    this.type = type;

    this.item = item;
    this.path = path;
    this.items = items;
  }
}
