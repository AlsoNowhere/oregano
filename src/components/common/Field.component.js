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

    getter(this, "hasLabel", function () {
      return !!this.label;
    });

    getter(this, "isInput", function () {
      return this.type !== "textarea" && this.type !== "select";
    });

    getter(this, "isTextArea", function () {
      return this.type === "textarea";
    });
  },
  {},
  [
    element("span", { "m-if": "hasLabel" }, "{label}"),

    element("input", {
      "m-if": "isInput",
      "[type]": "type",
      "[checked]": "checked",
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
