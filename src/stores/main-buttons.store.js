import { Resolver, Store } from "mint";

import { mainButtons } from "../data/main-button-options.data";
import { secondaryButtons } from "../data/secondary-button-options.data";

export const mainButtonsStore = new Store({
  mainButtonsElement: null,

  mainButtons,

  secondaryButtons: new Resolver(() =>
    secondaryButtons.filter(({ condition }) => {
      return condition instanceof Function ? condition() : condition;
    })
  ),
});
