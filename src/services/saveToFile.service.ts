import { appStore } from "../stores/app.store";

export const saveToFile = () => {
  window.dispatchEvent(
    new CustomEvent("saveToFile", { detail: appStore.rootData })
  );
};
