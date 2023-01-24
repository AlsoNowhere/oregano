import { component, element, refresh } from "mint";

import { Button } from "../../common/Button.component";
import { Field } from "../../common/Field.component";

import { wait } from "../../../services/wait.service";

import { manageStore } from "../../../stores/manage.store";

import { colours } from "../../../data/colours.data";

export const Manage = component(
  "section",
  function () {
    this.manageFormElement = null;

    manageStore.connect(this);

    this.oneach = async function () {
      const isEdit = manageStore.editItem !== null;
      if (isEdit) {
        manageStore.title = manageStore.editItem.title;
        manageStore.message = manageStore.editItem.message;
      } else {
        manageStore.title = "";
        manageStore.message = "";
        manageStore.currentColour = colours[0].colour;
      }
      await wait();
      this.manageFormElement?.title?.focus?.();
      this.manageFormElement["colour"].value = isEdit
        ? manageStore.editItem.colour
        : manageStore.currentColour;
      refresh(manageStore);
    };
  },
  { class: "constrain centred padding-large" },

  element(
    "form",
    {
      class: "form",
      autocomplete: "off",
      "(submit)": "onSubmit",
      "m-ref": "manageFormElement",
    },
    [
      element("h2", null, "Add item"),
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
            label: "Message",
            name: "message",
            "[value]": "message",
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
                class:
                  "width-large height-large margin-right-small margin-bottom-small",
              },
              element(
                "div",
                {
                  class: "rounded",
                  style: "box-shadow: inset 0 0 4px {colour};",
                },
                element(Field, {
                  type: "radio",
                  name: "colour",
                  class: "no-margin width-full height-full",
                  "[value]": "colour",
                  "[onInput]": "setColour",
                })
              )
            )
          ),
        ]),
      ]),

      element("div", { class: "grid-12" }, [
        element(Button, {
          type: "submit",
          class: "blueberry large margin-right",
          label: "Save",
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
