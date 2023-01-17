import { Store } from "mint";

import { mainButtons } from "../data/main-button-options.data";

export const mainButtonsStore = new Store({
  mainButtonsElement: null,

  mainButtons,
});
