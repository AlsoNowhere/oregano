import { TAction } from "../types/TAction.type";

export class Action {
  type: string;
  value: TAction | string;

  constructor(type: string, value: TAction | string) {
    this.type = type;
    this.value = value;
  }
}
