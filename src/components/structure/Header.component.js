import { component, element } from "mint";

import { version } from "../../data/constants.data";

const lineProps = {
  y1: "20",
  y2: "80",
  stroke: "#fff",
  "stroke-width": "2",
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
          class: "empty square large snow-text font-size-large",
        },
        element(
          "span",
          {
            style: "-webkit-app-region: no-drag",
          },
          "_"
        )
      ),
      element(
        "button",
        {
          type: "button",
          class: "empty square large",
        },
        element(
          "svg",
          {
            viewBox: "0 0 100 100",
          },
          [
            element("line", {
              x1: "20",
              x2: "80",
              ...lineProps,
            }),
            element("line", {
              x1: "80",
              x2: "20",
              ...lineProps,
            }),
          ]
        )
      ),
    ]),
  ]
);
