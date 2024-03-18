import { MintElement, element, span } from "mint";
import { styles } from "sage";

import { Field, TField } from "thyme";

const p = (a, c?) => element("p", !!c ? a : null, c || a);

export const getCheckbox = (label, checked: boolean) => {
  return element<TField>(Field, {
    type: "checkbox",
    label,
    checked,
    value: label,
    "[onInput]": "changeCheckbox",
  });
};

export const renderMessage = (message: string) => {
  const split = message.split("\n");
  const resolved: Array<MintElement> = [];

  split.forEach((x) => {
    if (x === "") return;
    if (x.includes("--c")) {
      const start =
        x.indexOf("--c-c") !== -1
          ? x.indexOf("--c-c") + 6
          : x.indexOf("--c") + 4;
      const label = x.substring(start);
      resolved.push(getCheckbox(label, x.includes("--c-c")));
      return;
    }
    if (x.includes("--b")) {
      resolved.push(p({ class: "bold" }, x.replace(/(--b\s?)/g, "")));
      return;
    }
    if (x.includes("--")) {
      resolved.push(
        p({ class: "bold line-height" }, [
          span({
            class: "fa fa-circle",
            style: styles({
              "vertical-align": "middle",
              "font-size": "0.4em",
            }),
          }),
          span(x.replace(/--/g, "")),
        ])
      );
      return;
    }
    resolved.push(p({ class: "line-height" }, x));
  });

  return resolved;

  // let lastIndex = 0;
  // let inCheckbox = false;
  // let checked = false;
  // let inBold = false;

  // split.forEach((x, i) => {
  //   if (inCheckbox && x === "\n") {
  //     resolved.push(getCheckbox(split, lastIndex, i, checked));
  //     lastIndex = i + 1;
  //     inCheckbox = false;
  //     checked = false;
  //   }

  //   if (inBold && x === "\n") {
  //     const join = split.slice(lastIndex, i).join("");
  //     resolved.push(element("p", { class: "bold" }, join));
  //     lastIndex = i + 1;
  //     inBold = false;
  //   }

  //   if (split.slice(i, i + 4).join("") === "--c ") {
  //     resolved.push(element("p", null, split.slice(lastIndex, i).join("")));
  //     lastIndex = i + 4;
  //     inCheckbox = true;
  //     checked = false;
  //   }

  //   if (split.slice(i, i + 6).join("") === "--c-c ") {
  //     resolved.push(element("p", null, split.slice(lastIndex, i).join("")));
  //     lastIndex = i + 6;
  //     inCheckbox = true;
  //     checked = true;
  //   }

  //   if (split.slice(i, i + 3).join("") === "--b") {
  //     resolved.push(element("p", null, split.slice(lastIndex, i).join("")));
  //     lastIndex = i + 3;
  //     inBold = true;
  //   }
  // });

  // if (inCheckbox) {
  //   resolved.push(getCheckbox(split, lastIndex, message.length, checked));
  // } else if (inBold) {
  //   const join = split.slice(lastIndex, message.length).join("");
  //   resolved.push(element("p", { class: "bold" }, join));
  // } else {
  //   const join = split.slice(lastIndex, split.length).join("");
  //   resolved.push(element("p", null, join));
  // }
};
