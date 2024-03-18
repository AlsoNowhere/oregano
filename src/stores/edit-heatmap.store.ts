import { IStore, MintEvent, Resolver, Store, element, refresh } from "mint";

import { wait, path, toast } from "sage";

import { getItem } from "../services/get-item.service";
import { renderMessage } from "../services/render-message.service";
import { getTodaysDate } from "../services/get-todays-date.service";

import { saveData } from "../logic/load-save.logic";
import { extractHeatmap } from "../logic/extract-heatmap.logic";

import { appStore } from "./app.store";

import { Item } from "../models/Item.model";

const changeCheckbox: MintEvent<HTMLInputElement> = function (_, element) {
  const { value } = element;
  const { heatmap } = editHeatmapStore.currentItem;
  if (heatmap === undefined) return;
  const [date] = path.get().slice(-1);
  const currentHeatmap = heatmap[date];
  if (element.checked) {
    currentHeatmap[value] = 1;
  } else {
    delete currentHeatmap[value];
  }
  saveData();
};

export const editHeatmapStore = new Store({
  day: "",
  month: "",
  year: "",

  message: "",

  currentItem: new Resolver(() => {
    const item = getItem(path.get().slice(1, -1));
    if (item === null) return null;
    return item;
  }),

  renderedMessage: new Resolver(() => {
    const output = element(
      "div",
      null,
      renderMessage(editHeatmapStore.message)
    );
    return output;
  }),

  changeCheckbox,

  oninsert: async function () {
    await wait();
    const item = editHeatmapStore.currentItem;
    if (item.message instanceof Array) return;

    // ** Get the relevant date from the url
    const [date] = path.get().slice(-1);

    // ** If no heatmap on this item or its todays date (handle that on List page) return to heatmap page.
    if (item.heatmap === undefined || date === getTodaysDate()) {
      path.set(["heat-map", ...path.get().slice(1, -1)]);
      toast("Cannot open heatmap if todays date", {
        theme: "orange",
        linger: 100000,
        classes: ["black-text"],
        buttonClasses: ["black-text"],
      });
      refresh(appStore);
      return;
    }

    // ** Add a heatmap if not one there before.
    if (item.heatmap[date] === undefined) item.heatmap[date] = {};

    const heat = item.heatmap[date];
    const message = item.message.replace(/--c-c/g, "--c");
    const _message = extractHeatmap(message, heat);
    const [d, m, y] = date.split("-");
    editHeatmapStore.day = d;
    editHeatmapStore.month = m;
    editHeatmapStore.year = y;
    editHeatmapStore.message = _message;

    refresh(editHeatmapStore);
  },
}) as IStore & {
  day: string;
  month: string;
  year: string;

  message: string;

  currentItem: Item;
};
