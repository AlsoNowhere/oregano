import { Resolver, Store, refresh } from "mint";

import { getItem } from "../services/get-item.service";
import { path } from "../services/path.service";
import { getDate } from "../services/get-date.service";
import { resolveLeadingZeroes } from "../services/resolve-leading-zeroes.service";

import { appStore } from "./app.store";

export const heatmapStore = new Store({
  currentItem: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return null;
    return item;
  }),

  year: "",
  month: "",
  monthStartDay: 0,
  weekDays: ["M", "T", "W", "T", "F", "S", "S"],

  heatmap: new Resolver(() => {
    const item = heatmapStore.currentItem;
    if (item === null) return [];

    const { month, year } = getDate();

    const heat = Object.entries(item.heatmap).filter(([key]) => {
      const [, m, y] = key.split("-");
      return m === month && y === year;
    });

    const days = Array(new Date(year, month, 0).getDate())
      .fill(null)
      .map((_, i) => ({
        hidden: false,
        title: `${resolveLeadingZeroes(i + 1)}-${month}-${year}`,
        day: i + 1,
      }));

    const initialDay = new Date(year, parseInt(month) - 1, 1).getDay() - 1;

    {
      let i = initialDay;
      while (i > 0) {
        days.unshift({ hidden: true });
        i--;
      }
    }

    const checkboxTotal = item.message.match(/--c/g)?.length;

    heat.forEach(([key, value]) => {
      const count = Object.values(value).reduce((a, b) => (b ? a + 1 : a), 0);
      const [d] = key.split("-");
      days[
        initialDay + parseInt(d) - 1
      ].style = `background-color: rgba(0, 255, 0, ${count / checkboxTotal});`;
    });

    return days;
  }),

  editHeatmap(_, element) {
    path.set(["edit-heat-map", ...path.get().slice(1), element.title]);
    refresh(appStore);
  },
});
