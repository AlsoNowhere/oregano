import { Item } from "../models/Item.model";
import { UndoConfig } from "../models/UndoConfig.model";
import { IData } from "./IData.interface";

export interface IRootData extends IData {
  root: true;
  timestamp_root: number;
  title: string;
  message: string;
  items: [];
  pasteItems: Array<Item>;
  undoItems: Array<UndoConfig>;
  itemIndex: number;
}
