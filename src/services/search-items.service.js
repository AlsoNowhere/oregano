export const searchItems = (list, value, output = [], route = []) => {
  list.forEach(({ title, items }, index) => {
    if (title.includes(value)) {
      output.push({ title, route: [...route, index] });
    }
    if (items instanceof Array) {
      searchItems(items, value, output, [...route, index]);
    }
  });
  return output;
};
