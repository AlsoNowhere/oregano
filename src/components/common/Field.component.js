import { component, element, getter } from "mint";

const commonProps = {
  class: "large",
  "[name]": "name",
  "[value]": "value",
  "[required]": "required",
  "(input)": "onInput",
};

export const Field = component(
  "label",
  function () {
    this.type = "text";
    this.required = false;
    this.onInput = null;
    this.fieldStyles = "";

    getter(this, "isInput", function () {
      return this.type !== "textarea" && this.type !== "select";
    });

    getter(this, "isTextArea", function () {
      return this.type === "textarea";
    });
  },
  {},
  [
    element("input", {
      "m-if": "isInput",
      ...commonProps,
      "[style]": "fieldStyles",
    }),
    element("textarea", {
      "m-if": "isTextArea",
      ...commonProps,
      "[style]": "fieldStyles",
    }),
  ]
);
