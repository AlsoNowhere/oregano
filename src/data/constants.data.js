import _package from "../../package.json";

export const sessionStorageKey = "oregano-v4-key";

// export const version = "4.0";
export const version = _package.version;

export const defaultData = JSON.stringify({
  root: true,
  timestamp_root: Date.now(),
  title: "Oregano",
  message: "",
  items: [],
  itemIndex: 0,
  pasteItems: [],
  undoItems: [],
});
