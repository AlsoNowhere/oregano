// const getNext = (str: Array<string>, i: number, next: number) =>
//   str.slice(i, i + next).join("");

import { MintElement } from "mint";
import { Item } from "../models/Item.model";
import { getCheckbox } from "../services/render-message.service";

// interface IMessage {
//   message: string | Array<string>;
// }

export const updateMessage = (label: string, item: Item) => {
  // const message =
  //   item.message instanceof Array ? item.message.join("") : item.message;

  const { message } = item;
  if (message instanceof Array) return;

  const split = message.split("\n");
  const output: Array<string> = [];

  split.forEach((x) => {
    if (x === "") return;
    if (x.includes("--c")) {
      const isChecked = x.includes("--c-c");
      const index = x.indexOf("--c");
      const start = isChecked ? index + 6 : index + 4;
      const _label = x.substring(start);
      if (label === _label) {
        output.push((isChecked ? "--c" : "--c-c") + " " + _label);
      } else {
        output.push(x);
      }
      // output.push(getCheckbox(label, x.includes("--c-c")));
    }
  });

  item.message = output.join("\n");

  // const split = message.split("");
  // // Get the indexes of the checkboxes as an Array of Objects
  // const indexes = split.reduce((a, _, index) => {
  //   const next4 = getNext(split, index, 4);
  //   const next6 = getNext(split, index, 6);
  //   if (next4 === "--c ") a.push({ index, state: false });
  //   if (next6 === "--c-c ") a.push({ index, state: true });
  //   return a;
  // }, []);
  // const dataId = parseInt(element.getAttribute("data-id"));
  // const before = split.slice(0, indexes[dataId].index);
  // const newCheckbox = indexes[dataId].state ? "--c " : "--c-c ";
  // const after = split.slice(
  //   indexes[dataId].index + (indexes[dataId].state ? 6 : 4),
  //   split.length
  // );
  // item.message = [...before, newCheckbox, ...after].join("");
};
