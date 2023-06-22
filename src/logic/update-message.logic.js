const getNext = (str, i, next) => str.slice(i, i + next).join("");

export const updateMessage = (element, item) => {
  const { message } = item;

  const split = message.split("");

  // Get the indexes of the checkboxes as an Array of Objects
  const indexes = split.reduce((a, _, index) => {
    const next4 = getNext(split, index, 4);
    const next6 = getNext(split, index, 6);
    if (next4 === "--c ") a.push({ index, state: false });
    if (next6 === "--c-c ") a.push({ index, state: true });
    return a;
  }, []);

  const dataId = parseInt(element.getAttribute("data-id"));

  const before = split.slice(0, indexes[dataId].index);
  const newCheckbox = indexes[dataId].state ? "--c " : "--c-c ";
  const after = split.slice(
    indexes[dataId].index + (indexes[dataId].state ? 6 : 4),
    split.length
  );

  item.message = [...before, newCheckbox, ...after].join("");
};
