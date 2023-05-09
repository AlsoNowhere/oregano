import { Resolver, Store, refresh, element } from "mint";

import { getItem } from "../services/get-item.service";
import { saveData } from "../services/load-save.service";
import { path } from "../services/path.service";
import { renderMessage } from "../services/render-message.service";
import { getTodaysDate } from "../services/get-todays-date.service";
import { generateHeatmap } from "../services/generate-heatmap.service";
import { getDate } from "../services/get-date.service";

import { appStore } from "./app.store";
import { manageStore } from "./manage.store";

import { UndoConfig } from "../models/UndoConfig.model";

import { actionButtons } from "../data/action-buttons.data";
import { itemActions } from "../data/item-actions.data";

export const listStore = new Store({
  depthIndexing: [],
  dragIndex: null,
  actionButtons,
  itemActions,

  currentItem: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item;
  }),

  currentTitle: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.title;
  }),

  currentCreatedAt: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null || item.createdAt === undefined) return "";
    const { minutes, hours, day, month, year } = getDate(
      item.createdAt + appStore.rootData.timestamp_root
    );
    return `Created at: ${day}-${month}-${year} ${hours}:${minutes}`;
  }),

  currentMessage: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.message;
  }),

  currentStyles: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null || item.actions === undefined) return "";
    const styles = item.actions.filter((x) => x.type === "style");
    return styles.reduce((a, b) => (a += b.value), "");
  }),

  getColour: new Resolver(function (a, b) {
    return "white";
  }),

  list: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return [];
    return item.items;
  }),

  items: new Resolver(() =>
    listStore.list.map(
      ({ index, title, message, colour, createdAt, edits }) => ({
        index,
        title,
        colour: colour || "white",
        createdAt,
        edits,
        hasMessage: !!message,
      })
    )
  ),

  messageIsArray: new Resolver(() => listStore.currentMessage instanceof Array),

  filteredActionButtons: new Resolver(() => {
    const actions = (listStore.currentItem.actions || []).map((x) => {
      const action = actionButtons.find(({ action: { id } }) => id === x);
      return { label: action.label, icon: action.icon };
    });
    return actions;
  }),

  renderedMessage: new Resolver(() => {
    let message = listStore.currentMessage;
    const hasCheckbox = message.includes("--c");
    if (
      listStore.currentItem.actions?.includes("heatmap") &&
      listStore.currentItem.heatmap?.[getTodaysDate()] === undefined
    ) {
      message = message.replace(/--c-c /g, "--c ");
    }
    return element(hasCheckbox ? "form" : "div", null, renderMessage(message));
  }),

  changeCheckbox(_, element) {
    const split = listStore.currentMessage.split("");
    const indexes = split.reduce((a, _, i) => {
      if (split.slice(i, i + 4).join("") === "--c ") {
        a.push({ index: i, state: false });
      } else if (split.slice(i, i + 6).join("") === "--c-c ") {
        a.push({ index: i, state: true });
      }
      return a;
    }, []);

    const dataId = parseInt(element.getAttribute("data-id"));

    listStore.currentItem.message = [
      ...split.slice(0, indexes[dataId].index),
      indexes[dataId].state ? "--c " : "--c-c ",
      ...split.slice(
        indexes[dataId].index + (indexes[dataId].state ? 6 : 4),
        split.length
      ),
    ].join("");

    if (listStore.currentItem.actions.includes("heatmap")) {
      const heatmap = generateHeatmap();
      if (listStore.currentItem.heatmap === undefined) {
        listStore.currentItem.heatmap = {};
      }
      const dateKey = getTodaysDate();
      listStore.currentItem.heatmap[dateKey] = heatmap;
    }
    saveData();
    refresh(listStore);
  },

  selectItem() {
    const nextIndex = this._i + "";
    path.set([...path.get(), nextIndex]);
    listStore.depthIndexing.push(nextIndex);
    refresh(listStore);
  },

  onDragStart() {
    listStore.dragIndex = this._i;
  },

  onDragOver(event) {
    event.preventDefault();
  },

  onDrop(_, __, scope) {
    const index = scope._i;
    const [holdItem] = listStore.list.splice(listStore.dragIndex, 1);
    listStore.list.splice(index, 0, holdItem);
    listStore.dragIndex = null;
    saveData();
    refresh(listStore);
  },

  editItem(event) {
    event.stopPropagation();
    manageStore.editItem = listStore.list[this.itemIndex];
    path.set(["manage", ...path.get().slice(1)]);
    refresh(appStore);
  },

  cutItem(event) {
    event.stopPropagation();
    const item = listStore.list[this.itemIndex];
    appStore.rootData.pasteItems.push(item);
    listStore.list.splice(this.itemIndex, 1);
    appStore.rootData.undoItems.unshift(
      new UndoConfig("cut", { item, path: path.get().slice(1) })
    );
    if (appStore.rootData.undoItems.length > 1)
      appStore.rootData.undoItems.pop();
    saveData();
    refresh(listStore);
  },

  deleteItem(event) {
    event.stopPropagation();
    const item = listStore.list[this.itemIndex];
    listStore.list.splice(this.itemIndex, 1);
    appStore.rootData.undoItems.unshift(
      new UndoConfig("delete", { item, path: path.get().slice(1) })
    );
    if (appStore.rootData.undoItems.length > 1)
      appStore.rootData.undoItems.pop();
    saveData();
    refresh(listStore);
  },
});
