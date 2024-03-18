import { appStore } from "../stores/app.store";

import { IData } from "../interfaces/IData.interface";

import { colours } from "../data/colours.data";

export class Item implements IData {
  title: string;
  message: string | Array<string>;
  colour: string;
  actions: Array<string>;

  items: Array<Item>;
  index: number;
  createdAt: number;
  edits: Array<{}>;
  heatmap?: Record<string, Record<string, 1>>;

  constructor(
    title = "",
    message: string | Array<string> = "",
    colour = colours[0].colour,
    actions = []
  ) {
    this.title = title;
    this.message = message;
    this.colour = colour;
    this.actions = actions;
    this.items = [];
    this.index = appStore.rootData.itemIndex++;
    this.createdAt = Math.floor(Date.now() - appStore.rootData.timestamp_root);
    this.edits = [];
  }
}
