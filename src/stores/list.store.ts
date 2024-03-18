import {
  Resolver,
  Store,
  refresh,
  element,
  IStore,
  MintEvent,
  MintElement,
} from "mint";

import { getDate, path } from "sage";

import { getItem } from "../services/get-item.service";
import { saveData } from "../logic/load-save.logic";
import { renderMessage } from "../services/render-message.service";
import { getActionAbles } from "../services/get-actions.service";

import { updateMessage } from "../logic/update-message.logic";
import { updateHeatmap } from "../logic/update-heatmap.logic";

import { appStore } from "./app.store";
import { manageStore } from "./manage.store";

import { UndoConfig } from "../models/UndoConfig.model";
import { Item } from "../models/Item.model";
import { ActionButton } from "../models/ActionButton.model";
import { ItemAction } from "../models/ItemAction.model";

import { actionButtons } from "../data/action-buttons.data";
import { itemActions } from "../data/item-actions.data";
import { colours } from "../data/colours.data";

import { IListData } from "../interfaces/IListData.interface";

import { UndoConfigs } from "../enums/undo-configs.enum";

const showOverflow = function () {
  const item = this.listElementRef.children[this.itemIndex];
  if (!item) return false;
  const [title] = item.getElementsByClassName("list-page__item-title");
  const [p] = item.getElementsByClassName("list-page__item-title-p");
  if (!p || p.offsetWidth === 0) return false;
  if (p.offsetWidth < title.offsetWidth) return false;
  return true;
};

export const listStore = new Store({
  depthIndexing: [],
  dragIndex: null,
  actionButtons,
  itemActions,
  listElementRef: null,

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

  currentMessage: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return "";
    return item.message;
  }),

  currentCreatedAt: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null || item.createdAt === undefined) return "";
    return `Created at: ${getDate(
      new Date(item.createdAt + appStore.rootData.timestamp_root),
      "dd-mm-yyyy hh:mm"
    )}`;
  }),

  currentStyles: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null || item.actions === undefined) return "";
    const _styles = getActionAbles(item.actions, "style");
    return _styles.reduce(
      (a, value) => (typeof value === "string" ? a + value : a),
      ""
    );
  }),

  list: new Resolver(() => {
    const item = getItem(path.get().slice(1));
    if (item === null) return [];
    return item.items;
  }),

  items: new Resolver(() => {
    return listStore.list.map(
      ({ index, title, message, colour, createdAt, edits }) =>
        ({
          index,
          title,
          colour: colour || "white",
          createdAt,
          edits,
          hasMessage: !!message,
        } as IListData)
    );
  }),

  messageIsArray: new Resolver(() => listStore.currentMessage instanceof Array),

  filteredActionButtons: new Resolver(() => {
    const actions = (listStore.currentItem.actions || []).map((x) => {
      const a = actionButtons.find(({ id }) => id === x);
      if (!a) return;
      const { title, icon, id } = a;
      return { title, icon, id };
    });
    return actions.filter((x) => !!x);
  }),

  renderedMessage: new Resolver(() => {
    let message = listStore.currentMessage;
    if (message instanceof Array) return message;
    const isForm = listStore.currentItem.actions?.includes("heatmap");
    const output = element(
      isForm ? "form" : "div",
      null,
      renderMessage(message)
    );
    return output;
  }),

  getTextColour: new Resolver(function () {
    const colour = colours.find(({ colour }) => colour === this.colour);
    return colour?.textColour || colours[0].colour;
  }),

  hasIcon: new Resolver(function () {
    return this.icon !== null;
  }),

  createdDate: new Resolver(function () {
    if (
      this.createdAt === undefined &&
      (!(this.edits instanceof Array) || this.edits.length === 0)
    )
      return "";
    const time: number =
      this.edits instanceof Array && this.edits.length > 0
        ? this.edits.at(-1)
        : this.createdAt;
    const message =
      this.edits instanceof Array && this.edits.length > 0
        ? "Edited at"
        : "Created at";
    return `${message}: ${getDate(new Date(time + appStore.rootData.timestamp_root), "dd-mm-yyyy hh:mm")}`;
  }),

  showOverflow: new Resolver(showOverflow),

  showOverflowClass: new Resolver(function () {
    return showOverflow.apply(this) ? "overflows" : "";
  }),

  messageIsToTheSide: new Resolver(() =>
    listStore.currentItem.actions?.includes("message-to-side")
      ? "flex flex-nowrap"
      : ""
  ),

  showItemsNumber: new Resolver(function () {
    const item = listStore.currentItem.items[this.itemIndex];
    return item.actions.includes("show-items-number");
  }),

  itemsCount: new Resolver(function () {
    const item = listStore.currentItem.items[this.itemIndex];
    return item.items.length;
  }),

  changeCheckbox(_, element) {
    updateMessage(element.value, listStore.currentItem);
    updateHeatmap(listStore.currentItem);
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
    path.set(["manage", ...path.get().slice(1), this.itemIndex]);
    refresh(appStore);
  },

  cutItem(event) {
    event.stopPropagation();
    const item = listStore.list[this.itemIndex];
    appStore.rootData.pasteItems.push(item);
    listStore.list.splice(this.itemIndex, 1);
    appStore.rootData.undoItems.unshift(
      new UndoConfig(UndoConfigs.cut, { item, path: path.get().slice(1) })
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
      new UndoConfig(UndoConfigs.delete, { item, path: path.get().slice(1) })
    );
    if (appStore.rootData.undoItems.length > 1)
      appStore.rootData.undoItems.pop();
    saveData();
    refresh(listStore);
  },
}) as IStore & {
  depthIndexing: Array<string>;
  dragIndex: number | null;
  actionButtons: Array<ActionButton>;
  itemActions: Array<ItemAction>;
  listElementRef: HTMLUListElement | null;
  currentItem: Item | null;
  currentTitle: string | null;
  currentMessage: Array<string> | string | null;
  currentCreatedAt: number | null;
  currentStyles: string;

  list: Array<Item>;
  items: Array<IListData>;

  messageIsArray: boolean;
  filteredActionButtons: Array<{ title: string; icon: string; id: string }>;
  renderedMessage: MintElement;

  changeCheckbox: MintEvent;
  selectItem: () => void;
  onDragStart: () => void;
  onDragOver: MintEvent;
  onDrop: MintEvent;
  editItem: MintEvent;
  cutItem: MintEvent;
  deleteItem: MintEvent;
};
