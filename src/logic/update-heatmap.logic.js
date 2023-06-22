import { generateHeatmap } from "../services/generate-heatmap.service";
import { getTodaysDate } from "../services/get-todays-date.service";

export const updateHeatmap = (item, dateKey = getTodaysDate()) => {
  // Only apply if item has heatmap
  if (!item.actions.includes("heatmap")) return;

  // Get a heatmap representation of the current message
  const heatmap = generateHeatmap(item.message);

  // If no heatmap object exists for this item, create it
  if (item.heatmap === undefined) {
    item.heatmap = {};
  }

  // Update todays heatmap
  item.heatmap[dateKey] = heatmap;
};
