import { Item } from "../models/Item.model";

export interface IData {
  title: string;
  message: string | Array<string>;
  colour: string;
  actions: Array<string>;

  items: Array<Item>;
  index: number;
  createdAt: number;
  edits: Array<{}>;
  heatmap?: {};
}
