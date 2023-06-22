export const generateHeatmap = (message) => {
  const heatmap = {};

  message
    .split("\n")
    .filter((x) => x.slice(0, 3) === "--c")
    .map((x) => {
      if (x.slice(0, 6) === "--c-c ") {
        heatmap[x.slice(6)] = 1;
      } else {
        heatmap[x.slice(4)] = 0;
      }
    });

  return heatmap;
};
