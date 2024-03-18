import _package from "../../package.json";

import { IRootData } from "../interfaces/IRootData.interface";
import { colours } from "./colours.data";

export const sessionStorageKey = "oregano-v4-key-2";

export const version = _package.version;

const data: IRootData = {
  root: true,
  timestamp_root: Date.now(),
  title: "Oregano",
  message: "",
  colour: colours[0].colour,
  actions: [],
  items: [],
  index: 0,
  createdAt: Date.now(),
  edits: [],
  pasteItems: [],
  undoItems: [],
  itemIndex: 1,
};

export const defaultData = JSON.stringify(data);
