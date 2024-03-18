import { TThemes } from "thyme";

export interface IListData {
  index: number;
  title: string;
  colour: TThemes;
  createdAt: number;
  edits: Array<{}>;
  hasMessage: boolean;
}
