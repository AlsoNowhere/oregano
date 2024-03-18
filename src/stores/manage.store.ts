import { IStore, MintEvent, Resolver, Store, refresh } from "mint";

import { path, styles, wait } from "sage";

import { FieldsetOption } from "thyme";

import { backToList } from "../services/back-to-list.service";
import { getActionAbles, getActions } from "../services/get-actions.service";
import { getTime } from "../services/get-time.service";

import { saveData } from "../logic/load-save.logic";

import { listStore } from "./list.store";
import { mainButtonsStore } from "./main-buttons.store";
import { appStore } from "./app.store";

import { Item } from "../models/Item.model";
import { UndoConfig } from "../models/UndoConfig.model";

import { site } from "../data/site.data";
import { actionButtons } from "../data/action-buttons.data";
import { colours } from "../data/colours.data";

import { UndoConfigs } from "../enums/undo-configs.enum";

const oninsert = async () => {
  actionButtons.forEach((actionButton) => {
    actionButton.active = false;
  });

  const isEdit = manageStore.editItem !== null;

  if (!isEdit) {
    // ** Create
    manageStore.title = "";
    manageStore.message = "";
    manageStore.currentColour = manageStore.colours[0].value;
  } else {
    // ** Edit
    manageStore.title = manageStore.editItem.title;
    {
      const message = manageStore.editItem.message;
      manageStore.message =
        message instanceof Array ? message.join("\n==b\n") : message;
    }
    manageStore.currentColour = manageStore.editItem.colour;
    (manageStore.editItem.actions || []).forEach((_action) => {
      const actionButton = actionButtons.find(({ id }) => id === _action);
      if (actionButton === undefined) return;
      actionButton.active = true;
    });
  }

  await wait();
  const form = manageStore.manageFormElementRef;
  if (form !== null) {
    const titleElementRef = Array.from(form.elements)
      .filter((x) => x instanceof HTMLInputElement)
      .find((x: HTMLInputElement) => x.name === "title");
    if (titleElementRef instanceof HTMLInputElement) {
      titleElementRef?.focus?.();
    }
    const colourElements = form.colour;
    (Array.from(colourElements) as Array<HTMLInputElement>).forEach((x) => {
      if (x.value === manageStore.currentColour) {
        x.checked = true;
      }
    });
  }

  refresh(manageStore);
};

const onSubmit: MintEvent<HTMLFormElement> = (event) => {
  event.preventDefault();
  const { title, currentColour } = manageStore;
  const message = (() => {
    const { message } = manageStore;
    const messages = message.split("\n==b\n");
    return messages.length > 1 ? messages : message;
  })();
  const actions = getActions();

  if (manageStore.editItem === null) {
    // ** Create
    const newItem = new Item(title, message, currentColour, actions);
    const [action] = getActionAbles(
      listStore.currentItem.actions || [],
      "add-to-list"
    );
    if (action instanceof Function) {
      action(listStore.currentItem, newItem);
    } else {
      listStore.list.push(newItem);
    }
    appStore.rootData.undoItems = [
      new UndoConfig(UndoConfigs.add, {
        item: newItem,
        path: path.get().slice(1),
      }),
    ];
    getActionAbles(actions || [], "init").forEach(
      (x) => x instanceof Function && x(newItem)
    );
  } else {
    // ** Edit
    manageStore.editItem.title = title;
    manageStore.editItem.message = message;
    manageStore.editItem.colour = currentColour;
    manageStore.editItem.actions = actions;
    if (!(manageStore.editItem.edits instanceof Array))
      manageStore.editItem.edits = [];
    manageStore.editItem.edits.push(getTime());
    manageStore.editItem = null;
  }

  saveData();

  listStore.depthIndexing = path.get().slice(1);
  backToList();
  (async () => {
    await wait();
    const [
      {
        children: [button],
      },
    ] = mainButtonsStore.mainButtonsElement.children;
    (button as HTMLElement)?.focus?.();
  })();
};

export const manageStore = new Store({
  title: "",
  message: "",
  colours: colours.map(
    (x) =>
      ({
        value: x.colour,
      } as FieldsetOption)
  ),
  currentColour: colours[0].colour,
  actionButtons: new Resolver(() => site.actionButtons),
  editItem: null,
  manageFormElementRef: null,

  isChecked: new Resolver(function () {
    return false;
  }),

  mainLabel: new Resolver(() =>
    manageStore.editItem !== null ? "Edit" : "Add"
  ),

  getTheme: new Resolver(function () {
    return this.active ? "blueberry" : "snow";
  }),

  saveButtonLabel: new Resolver(() =>
    manageStore.editItem !== null ? "Edit" : "Add"
  ),

  saveButtonTheme: new Resolver(() =>
    manageStore.editItem !== null ? "apple" : "blueberry"
  ),

  radioStyles: new Resolver(function () {
    return styles({
      "box-shadow": `inset 0 0 2px 2px ${this.value};`,
    });
  }),

  setTitle(_, element) {
    manageStore.title = element.value;
  },
  setMessage(_, element) {
    manageStore.message = element.value;
  },
  setColour(_, element) {
    manageStore.currentColour = element.value;
  },

  oninsert,

  onSubmit,

  cancel() {
    listStore.depthIndexing = path.get().slice(1);
    backToList();
  },
}) as IStore & {
  title: string;
  message: string;
  colours: Array<FieldsetOption>;
  currentColour: string;

  editItem: Item | null;
  manageFormElementRef: HTMLFormElement | null;

  isChecked: boolean;

  setTitle: MintEvent;
  setMessage: MintEvent;
  setColour: MintEvent;

  onSubmit: MintEvent;

  cancel: () => void;
};

site.manageStore = manageStore;
