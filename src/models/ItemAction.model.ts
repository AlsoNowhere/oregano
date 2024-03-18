import { MintEvent } from "mint";

export class ItemAction {
  icon: string;
  action: MintEvent;

  constructor(icon: string, action: MintEvent) {
    this.icon = icon;
    this.action = action;
  }
}
