import { appStore } from "../stores/app.store";

import { defaultData, sessionStorageKey } from "../data/constants.data";

export const loadData = async () => {
  const localData = localStorage.getItem(sessionStorageKey);
  const data =
    !localData || localData === "undefined" ? defaultData : localData;
  const parsed = JSON.parse(data);
  if (parsed.timestamp_root === undefined) {
    parsed.timestamp_root = Date.now();
  }
  appStore.rootData = parsed;
  saveData();
};

export const saveData = async () => {
  const data = appStore.rootData;
  localStorage.setItem(sessionStorageKey, JSON.stringify(data));
};
