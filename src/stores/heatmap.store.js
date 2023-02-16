import { Resolver, Store } from "mint";

import { getItem } from "../services/get-item.service";
import { path } from "../services/path.service";

export const heatmapStore = new Store({
  currentItem: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return null;
    return item;
  }),

  month: "",
  monthStartDay: 0,

  heatmap: new Resolver(() => {
    const item = heatmapStore.currentItem;
    if (item === null) return [];

    const date = new Date();
    const [month, year] = [date.getMonth(), date.getFullYear()];

    const heat = Object.entries(item.heatmap).reduce((a, [key, value]) => {
      const [d, m, y] = key.split("-");
      if (parseInt(m) === month + 1 && parseInt(y) === year) a[d] = value;
      return a;
    }, {});

    const days = Array(
      heatmapStore.monthStartDay + new Date(year, month + 1, 0).getDate()
    )
      .fill(null)
      .map((_, i) => {
        const day = heat[i - heatmapStore.monthStartDay + 1];
        const intensity =
          day === undefined
            ? 0
            : Object.values(day).reduce((a, b) => ((a += b), a), 0) /
              Object.values(day).length;
        return {
          hidden: i < heatmapStore.monthStartDay,
          fill: `background-color: rgba(100, 250, 100, ${intensity});`,
        };
      });

    return days;
  }),
});
