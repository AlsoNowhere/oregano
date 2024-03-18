import { generateHeatmap } from "../services/generate-heatmap.service";
import { getTodaysDate } from "../services/get-todays-date.service";

import { Item } from "../models/Item.model";

export const updateHeatmap = (item: Item, dateKey = getTodaysDate()) => {
  const message = item.message;

  // ** Only apply if item has heatmap
  if (!item.actions.includes("heatmap") || message instanceof Array) return;

  // ** Get a heatmap representation of the current message
  const heatmap = generateHeatmap(message);

  // ** If no heatmap object exists for this item, create it
  if (item.heatmap === undefined) {
    item.heatmap = {};
  }

  // ** Update todays heatmap
  item.heatmap[dateKey] = heatmap;

  // ** Clean up heatmap
  Object.entries(item.heatmap).forEach(([key, value]) => {
    if (Object.keys(value).length === 0) {
      delete item.heatmap[key];
    }
  });
};
