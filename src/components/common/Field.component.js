import { component, element, getter, template, MintElement } from "mint";

const commonProps = {
  "[name]": "name",
  "[class]": "class",
  "[value]": "value",
  "[required]": "required",
  "(input)": "onInput",
  "[data-id]": "dataId",
};

export const Field = component(
  "div",
  function () {
    this.type = "text";
    this.required = false;
    this.onInput = null;
    this.class = undefined;
    this.value = null;
    this.fieldStyles = undefined;
    this.dataId = undefined;
    this.labelBefore = false;

    getter(this, "hasLabelBefore", function () {
      return (
        !!this.label &&
        !this.isLabelMintElement &&
        this.type !== "checkbox" &&
        this.type !== "radio"
      );
    });

    getter(this, "hasLabelAfter", function () {
      return (
        !!this.label &&
        !this.isLabelMintElement &&
        (this.type === "checkbox" || this.type === "radio")
      );
    });

    getter(this, "isLabelMintElement", function () {
      return this.label instanceof MintElement;
    });

    getter(this, "isInput", function () {
      return this.type !== "textarea" && this.type !== "select";
    });

    getter(this, "isTextArea", function () {
      return this.type === "textarea";
    });

    getter(this, "isCheckboxClass", function () {
      return this.type === "checkbox" ? "checkbox" : undefined;
    });
  },
  { class: "relative" },
  [
    element(
      "div",
      { "m-if": "isLabelMintElement", "[class]": "labelClass" },
      template("label", false)
    ),
    element("label", { "[class]": "isCheckboxClass" }, [
      element("span", { "m-if": "hasLabelBefore" }, "{label}"),

      element("input", {
        "m-if": "isInput",
        "[type]": "type",
        "[checked]": "checked",
        ...commonProps,
        "[style]": "fieldStyles",
      }),

      element("span", { "m-if": "hasLabelAfter" }, "{label}"),

      element("textarea", {
        "m-if": "isTextArea",
        ...commonProps,
        "[style]": "fieldStyles",
      }),
    ]),
  ]
);
