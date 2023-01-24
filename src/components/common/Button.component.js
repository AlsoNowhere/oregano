import { component, element, getter } from "mint";

export const Button = component(
  "button",
  function () {
    this.type = "button";
    this.class = "";
    this.icon = null;
    this.label = null;
    this.disabled = false;
    this.extraButtonLabel = null;
    this.onClick = null;
    this.title = undefined;

    getter(this, "hasIcon", function () {
      return this.icon !== null;
    });

    getter(this, "hasLabel", function () {
      return this.label !== null;
    });

    getter(this, "hasExtraButtonLabel", function () {
      return (
        this.extraButtonLabel !== null && this.extraButtonLabel !== undefined
      );
    });

    getter(this, "getExtraButtonLabel", function () {
      return this.extraButtonLabel();
    });
  },
  {
    "[type]": "type",
    class: "{class}",
    "[title]": "title",
    "[disabled]": "disabled",
    "(click)": "onClick",
  },
  [
    element(
      "span",
      { "m-if": "hasIcon", class: "fa fa-{icon}" },
      element(
        "span",
        { "m-if": "hasExtraButtonLabel" },
        "{getExtraButtonLabel}"
      )
    ),
    element("span", { "m-if": "hasLabel" }, [
      element("span", null, "{label}"),
      element(
        "span",
        { "m-if": "hasExtraButtonLabel" },
        "{getExtraButtonLabel}"
      ),
    ]),
  ]
);
