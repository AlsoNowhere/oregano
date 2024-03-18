import { Item } from "../models/Item.model";

interface IOutput {
  title: string;
  route: Array<number>;
}

export const searchItems = (
  list: Array<Item>,
  value: string,
  output: Array<IOutput> = [],
  route: Array<number> = []
) => {
  list.forEach(({ title, items }, index) => {
    if (title.toLowerCase().includes(value.toLowerCase())) {
      output.push({ title, route: [...route, index] });
    }
    if (items instanceof Array) {
      searchItems(items, value, output, [...route, index]);
    }
  });
  return output;
};
