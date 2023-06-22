const getNext = (str, i, x) => str.substr(i, x);

export const extractHeatmap1 = (message, heat) => {
  const indexes = [];
  {
    let i = 0;
    while (i < message.length) {
      const next4 = getNext(message, i, 4);
      if (next4 === "--c ") {
        const endIndex = message.slice(i).indexOf("\n");
        indexes.push({
          start: i,
          label: message
            .slice(i)
            .substr(4, endIndex === -1 ? Infinity : endIndex - 4),
          state: false,
        });
      }

      const next6 = getNext(message, i, 6);
      if (next6 === "--c-c ") {
        const endIndex = message.slice(i).indexOf("\n");
        indexes.push({
          start: i,
          label: message
            .slice(i)
            .substr(6, endIndex === -1 ? Infinity : endIndex - 6),
          state: true,
        });
      }

      i++;
    }
  }

  return indexes;
};

export const extractHeatmap = (message, heat) => {
  let _message = "";
  let i = 0;
  while (i < message.length) {
    const next4 = getNext(message, i, 4);
    if (next4 !== "--c ") {
      _message += message.charAt(i);
      i++;
      continue;
    }
    const endIndex = message.slice(i).indexOf("\n");
    const label = message
      .slice(i)
      .substr(4, endIndex === -1 ? Infinity : endIndex - 4);
    if (heat[label] === 1) {
      _message += "--c-c ";
    } else {
      _message += "--c ";
    }
    i += 4;

    // i++;
  }
  return _message;
};
