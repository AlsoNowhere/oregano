import { IStore, Resolver, Store, refresh } from "mint";

import { path, styles, wait } from "sage";

import { getItem } from "../services/get-item.service";
import { getResolvedDate } from "../services/get-resolved-date.service";
import { resolveLeadingZeroes } from "../services/resolve-leading-zeroes.service";
import { getTodaysDate } from "../services/get-todays-date.service";

import { appStore } from "./app.store";

import { Item } from "../models/Item.model";

import { months } from "../data/months.data";

interface IDay {
  hidden: boolean;
  title?: string;
  day?: number;
  style?: string;
}

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

  heatmap: new Resolver<Array<IDay>>(() => {
    const item = heatmapStore.currentItem;
    if (item === null || item.message instanceof Array) return [];

    const { month, year } = getResolvedDate();

    const isToday = (day: number) => {
      const { day: d, month: m, year: y } = getResolvedDate();
      return d === day && m === month && y === year;
    };

    const message = item.message;
    const checkboxTotal = message.match(/--c/g)?.length;

    const days: Array<IDay> = Array(new Date(year, month, 0).getDate())
      .fill(null)
      .map((_, i) => {
        const title = `${resolveLeadingZeroes(i + 1)}-${resolveLeadingZeroes(
          month
        )}-${year}`;
        const output: IDay = {
          hidden: false,
          title,
          day: i + 1,
        };
        const _styles: Record<string, string> = {};
        if (item.heatmap?.[title] !== undefined) {
          _styles["background-color"] = `rgba(25, 207, 73, ${
            Math.floor(
              (Object.keys(item.heatmap[title]).length / checkboxTotal) * 100
            ) / 100
          })`;
        }
        if (isToday(i + 1)) {
          _styles.border = "2px solid orange";
        }
        output.style = styles(_styles);
        return output;
      });

    let initialDay = new Date(year, month - 1, 1).getDay() - 1;
    if (initialDay === -1) {
      initialDay = 6;
    }

    {
      let i = initialDay;
      while (i > 0) {
        days.unshift({ hidden: true });
        i--;
      }
    }

    return days;
  }),

  getShadow: new Resolver(function () {
    return this.title === getTodaysDate() ? "z-index shadow-block-orange" : "";
  }),

  oninsert: async function () {
    await wait();
    const item = heatmapStore.currentItem;
    if (!item.actions.includes("heatmap")) {
      path.set(["list", ...path.get().slice(1)]);
      refresh(appStore);
      return;
    }
    const date = new Date();
    const [month, year] = [date.getMonth(), date.getFullYear()];
    heatmapStore.year = year.toString();
    heatmapStore.month = months[month];
    heatmapStore.monthStartDay = new Date(year, month + 1, 1).getDay() - 1;
    refresh(this);
  },

  editHeatmap(_, element) {
    path.set(["edit-heat-map", ...path.get().slice(1), element.title]);
    refresh(appStore);
  },
}) as IStore & {
  currentItem: Item;
  year: string;
  month: string;
  monthStartDay: number;
  weekDays: ["M", "T", "W", "T", "F", "S", "S"];
};
