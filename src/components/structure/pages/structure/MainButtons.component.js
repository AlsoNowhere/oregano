import { component, element } from "mint";

import { Button } from "../../../common/Button.component";

import { mainButtonsStore } from "../../../../stores/main-buttons.store";

export const MainButtons = component(
  "div",
  function () {
    this._mainButtonsElement = null;

    mainButtonsStore.connect(this);

    this.oninsert = function () {
      mainButtonsStore.mainButtonsElement = this._mainButtonsElement;
    };
  },
  null,
  element(
    "ul",
    { class: "list flex margin-bottom", "m-ref": "_mainButtonsElement" },
    element(
      "li",
      { "m-for": "mainButtons", "m-key": "_i" },
      element(Button, {
        class: "square large margin-right font-size-large {theme}",
        "[icon]": "icon",
        "[theme]": "theme",
        "[disabled]": "disabled",
        "[extraButtonLabel]": "extraButtonLabel",
        "[onClick]": "onClick",
      })
    )
  )
);
