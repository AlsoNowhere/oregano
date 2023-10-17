import { component, element } from "mint";

import { version } from "../../data/constants.data";

const lineProps = {
  y1: "4",
  y2: "28",
};

export const Header = component(
  "header",
  function () {
    this.version = version;
  },
  { class: "header" },
  [
    element("h1", null, [
      element("span", null, "Oregano"),
      element(
        "span",
        { style: "font-size:18px;line-height:18px;" },
        "v{version}"
      ),
    ]),
    element("div", { class: "flex" }, [
      element(
        "button",
        {
          type: "button",
          class: "empty square snow-text font-size",
        },
        element("span", {
          class: "block absolute middle width-small height",
        })
      ),
      element(
        "button",
        {
          type: "button",
          class: "empty square",
        },
        element(
          "svg",
          {
            class: "absolute middle width height",
            viewBox: "0 0 32 32",
          },
          [
            element("line", {
              x1: "4",
              x2: "28",
              ...lineProps,
            }),
            element("line", {
              x1: "28",
              x2: "4",
              ...lineProps,
            }),
          ]
        )
      ),
    ]),
  ]
);
