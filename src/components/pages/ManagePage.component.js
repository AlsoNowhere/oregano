import { component, element, getter, refresh } from "mint";

import { Button } from "../common/Button.component";
import { Field } from "../common/Field.component";

import { wait } from "../../services/wait.service";

import { manageStore } from "../../stores/manage.store";

import { colours } from "../../data/colours.data";
import { actionButtons } from "../../data/action-buttons.data";

export const Manage = component(
  "section",
  function () {
    this.manageFormElement = null;

    manageStore.connect(this);

    this.oninsert = async function () {
      actionButtons.forEach((actionButton) => {
        actionButton.active = false;
      });

      const isEdit = manageStore.editItem !== null;

      if (!isEdit) {
        // Create
        manageStore.title = "";
        manageStore.message = "";
        manageStore.currentColour = colours[0].colour;
      } else {
        // Edit
        manageStore.title = manageStore.editItem.title;
        {
          const message = manageStore.editItem.message;
          manageStore.message =
            message instanceof Array ? message.join("\n==b\n") : message;
        }
        manageStore.currentColour = manageStore.editItem.colour;
        (manageStore.editItem.actions || []).forEach((_action) => {
          const actionButton = actionButtons.find(({ id }) => id === _action);
          if (actionButton === undefined) return;
          actionButton.active = true;
        });
      }

      await wait();
      this.manageFormElement?.title?.focus?.();
      this.manageFormElement["colour"].value = manageStore.currentColour;

      refresh(manageStore);
    };

    getter(this, "mainLabel", () =>
      manageStore.editItem !== null ? "Edit" : "Add"
    );

    getter(this, "messageLabel", () =>
      element("div", { class: "flex space-between" }, [
        element("p", { class: "no-margin line-height" }, "Message"),
      ])
    );

    getter(this, "getTheme", function () {
      return this.active ? "blueberry" : "snow";
    });

    getter(this, "saveButtonLabel", () =>
      manageStore.editItem !== null ? "Edit" : "Add"
    );

    getter(this, "saveButtonTheme", () =>
      manageStore.editItem !== null ? "apple" : "blueberry"
    );
  },
  { class: "constrain centred padding-bowl-large" },

  element(
    "form",
    {
      class: "form manage-form",
      autocomplete: "off",
      "(submit)": "onSubmit",
      "m-ref": "manageFormElement",
    },
    [
      element("h2", null, "{mainLabel} item"),

      element("div", { class: "flex" }, [
        element("div", { class: "grid-9 padded-right-small" }, [
          element(Field, {
            label: "Title",
            name: "title",
            required: "required",
            "[value]": "title",
            "[onInput]": "setTitle",
          }),

          element(Field, {
            type: "textarea",
            "[label]": "messageLabel",
            labelClass: "relative",
            class: "manage-form__message",
            name: "message",
            "[value]": "message",
            fieldStyles: "height: 23rem; resize: none;",
            "[onInput]": "setMessage",
          }),
        ]),

        element("fieldset", { class: "grid-3 padding-left" }, [
          element("legend", { class: "width-full" }, "Colour"),
          element(
            "ul",
            { class: "list flex width-full" },
            element(
              "li",
              {
                "m-for": "colours",
                "m-key": "colour",
                class: "margin-right-small margin-bottom-small",
              },
              element(
                "div",
                {
                  class: "round",
                  style: "box-shadow: inset 0 0 2px 2px {colour};",
                },
                element(Field, {
                  type: "radio",
                  name: "colour",
                  class: "no-margin round",
                  "[value]": "colour",
                  "[onInput]": "setColour",
                })
              )
            )
          ),
        ]),
      ]),

      element("ul", { class: "list flex margin-bottom" }, [
        element(
          "li",
          {
            "m-for": "actionButtons",
            "m-key": "id",
          },
          element(Button, {
            class: "{theme} square",
            "[label]": "label",
            "[icon]": "icon",
            "[title]": "title",
            "[id]": "id",
            "[active]": "active",
            "[theme]": "getTheme",
            "[onClick]": "onClick",
          })
        ),
      ]),

      element("div", { class: "grid-12" }, [
        element(Button, {
          type: "submit",
          class: "{saveButtonTheme} large margin-right",
          "[label]": "saveButtonLabel",
          "[saveButtonTheme]": "saveButtonTheme",
        }),
        element(Button, {
          class: "smoke large",
          label: "Cancel",
          "[onClick]": "cancel",
        }),
      ]),
    ]
  )
);
