import { MintComponent, component, element } from "mint";

import { Button, Field, TField } from "thyme";

import { styles } from "sage";

import { manageStore } from "../../stores/manage.store";

class ManageComponent extends MintComponent {
  constructor() {
    super();

    manageStore.connect(this);
  }
}

export const Manage = component(
  "section",
  ManageComponent,
  { class: "constrain centred padding-bowl-large" },

  element(
    "form",
    {
      class: "form manage-form",
      autocomplete: "off",
      "(submit)": "onSubmit",
      mRef: "manageFormElementRef",
    },
    [
      element("h2", null, "{mainLabel} item"),

      element("div", { class: "flex" }, [
        element("div", { class: "grid-9 padded-right-small" }, [
          element<TField>(Field, {
            name: "title",
            "[value]": "title",
            label: "Title",
            required: true,
            "[onInput]": "setTitle",
          }),

          element<TField>(Field, {
            type: "textarea",
            name: "message",
            "[value]": "message",
            label: "Message",
            labelClass: "relative",
            class: "manage-form__message",
            fieldStyles: styles({ height: "23rem", resize: "none" }),
            "[onInput]": "setMessage",
          }),
        ]),

        element("div", { class: "grid-3 padding-left" }, [
          element<TField>(Field, {
            type: "fieldset",
            name: "colour",
            legend: "Colour",
            "[value]": "currentColour",
            labelClass: "round",
            "[labelStyles]": "radioStyles",
            "[options]": "colours",
            "[onInput]": "setColour",
          }),
        ]),
      ]),

      element("ul", { class: "list flex margin-bottom" }, [
        element(
          "li",
          {
            mFor: "actionButtons",
            mKey: "id",
          },
          element(Button, {
            "[theme]": "getTheme",
            "[icon]": "icon",
            "[label]": "label",
            "[title]": "title",
            square: true,
            "[onClick]": "onClick",
            "[id]": "id",
            "[active]": "active",
          })
        ),
      ]),

      element("div", { class: "grid-12" }, [
        element(Button, {
          type: "submit",
          "[theme]": "saveButtonTheme",
          "[label]": "saveButtonLabel",
          class: "margin-right padded-small",
          large: true,
          "[saveButtonTheme]": "saveButtonTheme",
        }),
        element(Button, {
          theme: "smoke",
          label: "Cancel",
          class: "large padded-small",
          "[onClick]": "cancel",
        }),
      ]),
    ]
  )
);
