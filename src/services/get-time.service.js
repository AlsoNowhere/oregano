import { appStore } from "../stores/app.store";

export const getTime = () =>
  Math.floor(Date.now() - appStore.rootData.timestamp_root);
