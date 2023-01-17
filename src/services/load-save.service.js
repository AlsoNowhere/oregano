import { appStore } from "../stores/app.store";

import { defaultData, sessionStorageKey } from "../data/constants.data";

export const loadData = async () => {
  const localData = localStorage.getItem(sessionStorageKey);
  const data =
    !localData || localData === "undefined" ? defaultData : localData;
  const parsed = JSON.parse(data);
  appStore.rootData = parsed;
};

export const saveData = async () => {
  const data = appStore.rootData;
  localStorage.setItem(sessionStorageKey, JSON.stringify(data));
};
