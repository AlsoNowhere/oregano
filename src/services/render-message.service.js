import { element } from "mint";

import { Field } from "../components/common/Field.component";

export const renderMessage = (str) => {
  const split = str.split("");
  const resolved = [];

  let checkboxIndex = 0;
  let lastIndex = 0;
  let inCheckbox = false;
  let checked = false;
  let inBold = false;

  split.forEach((x, i) => {
    if (inCheckbox && x === "\n") {
      resolved.push(
        element(Field, {
          type: "checkbox",
          label: split.slice(lastIndex, i).join(""),
          checked,
          "[onInput]": "changeCheckbox",
          dataId: (checkboxIndex++).toString(),
        })
      );
      lastIndex = i + 1;
      inCheckbox = false;
      checked = false;
    }

    if (inBold && x === "\n") {
      resolved.push(
        element(
          "p",
          {
            class: "bold",
          },
          split.slice(lastIndex, i).join("")
        )
      );
      lastIndex = i + 1;
      inBold = false;
    }

    if (split.slice(i, i + 4).join("") === "--c ") {
      resolved.push(element("p", null, split.slice(lastIndex, i).join("")));
      lastIndex = i + 4;
      inCheckbox = true;
      checked = false;
    }

    if (split.slice(i, i + 6).join("") === "--c-c ") {
      resolved.push(element("p", null, split.slice(lastIndex, i).join("")));
      lastIndex = i + 6;
      inCheckbox = true;
      checked = true;
    }

    if (split.slice(i, i + 3).join("") === "--b") {
      resolved.push(element("p", null, split.slice(lastIndex, i).join("")));
      lastIndex = i + 3;
      inBold = true;
    }
  });

  if (inCheckbox) {
    resolved.push(
      element(Field, {
        type: "checkbox",
        label: split.slice(lastIndex, str.length).join(""),
        checked,
        "[onInput]": "changeCheckbox",
        dataId: checkboxIndex.toString(),
      })
    );
  } else if (inBold) {
    resolved.push(
      element(
        "p",
        {
          class: "bold",
        },
        split.slice(lastIndex, str.length).join("")
      )
    );
  } else {
    resolved.push(
      element("p", null, split.slice(lastIndex, split.length).join(""))
    );
  }

  return resolved.filter((x) => x.content[0] !== "");
};
