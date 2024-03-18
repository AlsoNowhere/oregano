import { MintElement } from "mint";
import { TThemes } from "thyme";

export class MainButton {
  name: string;
  title: string;
  icon: string;
  theme: TThemes;
  disabled: (() => boolean) | false;
  condition: (() => boolean) | true;
  extraButtonLabel?: () => string | MintElement;
  onClick: () => void;

  constructor(
    name: string,
    title: string,
    icon: string,
    theme: TThemes,
    onClick: () => void,
    options: {
      disabled?: () => boolean;
      condition?: () => boolean;
      extraButtonLabel?: () => string | MintElement;
    } = {}
  ) {
    this.name = name;
    this.title = title;
    this.icon = icon;
    this.theme = theme;
    this.onClick = onClick;

    this.disabled =
      options.disabled instanceof Function ? options.disabled : false;
    this.condition =
      options.condition instanceof Function ? options.condition : true;
    this.extraButtonLabel = options.extraButtonLabel;
  }
}
