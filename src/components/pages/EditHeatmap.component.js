import { component, element, refresh, template } from "mint";

import { AltButtons } from "../additions/AltButtons.component";

import { wait } from "../../services/wait.service";
import { path } from "../../services/path.service";
import { getTodaysDate } from "../../services/get-todays-date.service";

import { extractHeatmap } from "../../logic/extract-heatmap.logic";

import { editHeatmapStore } from "../../stores/editheatmap.store";
import { appStore } from "../../stores/app.store";

export const EditHeatmap = component(
  "div",
  function () {
    editHeatmapStore.connect(this);

    this.oninsert = async function () {
      await wait();
      const [date] = path.get().slice(-1);
      const item = editHeatmapStore.currentItem;
      if (item.heatmap === undefined || date === getTodaysDate()) {
        path.set(["heat-map", ...path.get().slice(1, -1)]);
        refresh(appStore);
        return;
      }
      if (item.heatmap[date] === undefined) {
        item.heatmap[date] = {};
      }
      const heat = item.heatmap?.[date];
      const message = item.message.replace(/--c-c/g, "--c");
      const _message = extractHeatmap(message, heat);
      const [d, m, y] = date.split("-");
      editHeatmapStore.day = d;
      editHeatmapStore.month = m;
      editHeatmapStore.year = y;
      editHeatmapStore.message = _message;
      refresh(editHeatmapStore);
    };
  },
  null,
  [
    element(AltButtons, { type: "edit-heat-map" }),

    element(
      "section",
      { class: "other-content" },
      element("div", { class: "other-content__container" }, [
        element("h2", null, "Edit Heat map"),

        element("p", null, "{day} - {month} - {year}"),

        element(
          "div",
          { style: "white-space: pre-wrap; {currentStyles}" },
          template("renderMessage")
        ),
      ])
    ),
  ]
);
