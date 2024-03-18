import { component, element } from "mint";

export const Title = component(
  "div",
  null,
  { class: "flex flex-nowrap space-between align-start relative" },
  [
    element("h2", { class: "page-title reset-margin" }, "{currentTitle}"),

    element(
      "ul",
      { class: "list flex align-centre" },
      element(
        "li",
        {
          mFor: "filteredActionButtons",
          mKey: "id",
          class: "padding-left",
        },
        element("span", { "[title]": "title" }, [
          element("span", { mIf: "hasIcon", class: "fa fa-{icon}" }),
        ])
      )
    ),
  ]
);
