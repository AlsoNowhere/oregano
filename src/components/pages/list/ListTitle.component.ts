import { component, element } from "mint";

export const ListTitle = component(
  "div",
  null,
  { class: "list-page__item-title {showOverflowClass}" },
  [
    element(
      "span",
      {
        mIf: "showOverflow",
        class: "list-page__item-title-overflow",
      },
      "..."
    ),
    element("p", { class: "list-page__item-title-p" }, "{title}"),
  ]
);
