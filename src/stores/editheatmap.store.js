import { Resolver, Store, element, refresh } from "mint";

import { getItem } from "../services/get-item.service";
import { path } from "../services/path.service";
import { renderMessage } from "../services/render-message.service";
import { generateHeatmap } from "../services/generate-heatmap.service";
import { saveData } from "../services/load-save.service";

import { updateMessage } from "../logic/update-message.logic";

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

  renderMessage: new Resolver(() => {
    const output = element(
      "div",
      null,
      renderMessage(editHeatmapStore.message)
    );
    return output;
  }),

  changeCheckbox(_, element) {
    const item = editHeatmapStore.currentItem;
    const [date] = path.get().slice(-1);
    updateMessage(element, editHeatmapStore);
    const heatmap = generateHeatmap(editHeatmapStore.message);
    item.heatmap[date] = heatmap;
    saveData();
    refresh(editHeatmapStore);
  },
});
