import { MintComponent, component, element } from "mint";

import { Button } from "thyme";

import { mainButtonsStore } from "../../stores/main-buttons.store";

class MainButtonsComponent extends MintComponent {
  constructor() {
    super();

    mainButtonsStore.connect(this);
  }
}

export const MainButtons = component(
  "div",
  MainButtonsComponent,
  { class: "list-page__main-buttons" },
  [
    element(
      "ul",
      {
        class: "list flex margin-bottom-small",
        mRef: "mainButtonsElement",
      },
      element(
        "li",
        {
          mFor: "mainButtons",
          mKey: "_i",
        },
        element(Button, {
          "[theme]": "theme",
          "[icon]": "icon",
          "[title]": "title",
          class: "list-page__main-buttons-button",
          "[disabled]": "disabled",
          "[extraButtonLabel]": "extraButtonLabel",
          "[onClick]": "onClick",
        })
      )
    ),
    element(
      "ul",
      { class: "list flex margin-bottom-small" },
      element(
        "li",
        { mFor: "secondaryButtons", mKey: "_i" },
        element(Button, {
          "[theme]": "theme",
          "[icon]": "icon",
          "[title]": "title",
          class: "list-page__main-buttons-button",
          "[disabled]": "disabled",
          "[extraButtonLabel]": "extraButtonLabel",
          "[onClick]": "onClick",
        })
      )
    ),
  ]
);
