import { Item } from "../models/Item.model";

export type TAction = (currentItem: Item, newItem?: Item) => void;
