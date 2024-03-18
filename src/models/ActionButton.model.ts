import { MintEvent, refresh } from "mint";

import { TThemes } from "thyme";

import { actionButtons } from "../data/action-buttons.data";
import { site } from "../data/site.data";
import { Action } from "./Action.model";

type options = {
  label?: string;
  icon?: string;
  title: string;
  id: string;
};

export class ActionButton {
  label: string;
  icon: string;
  title: string;
  id: string;
  active: boolean;
  theme: TThemes;
  action?: Action;
  onClick: MintEvent;

  constructor({ label, icon, title, id }: options, action?) {
    this.label = label;
    this.icon = icon;
    this.title = title;
    this.action = action;
    this.onClick = function () {
      const actionButton = actionButtons.find(({ id }) => id === this.id);
      actionButton.active = !actionButton.active;
      actionButton.theme = actionButton.active ? "blueberry" : "snow";
      refresh(site.manageStore);
    };
    this.id = id;
    this.active = false;
    this.theme = "snow";
  }
}
