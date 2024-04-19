import _package from "../package.json";

import { component, element, app, MintComponent, div } from "mint";

import {
  Header,
  List,
  Manage,
  ExportData,
  ImportData,
  TreeView,
  GraphView,
  Heatmap,
  EditHeatmap,
  Search,
  appInit,
  appStore,
} from "oregano-core";

appStore.mainButtons = [
  "Add",
  "Edit",
  "Level up",
  "Up to root",
  "Paste",
  "Save",
];
appStore.secondaryButtons = [
  "Undo",
  "Export",
  "Import",
  "Tree",
  "Search",
  "Graph",
  "Heatmap",
];
appStore.sessionStorageKey = "oregano-v4-key";
appStore.version = _package.version;

class AppComponent extends MintComponent {
  constructor() {
    super();

    this.oninsert = function () {
      appInit();
    };

    appStore.connect(this);
  }
}

const App = component("main", AppComponent, null, [
  element(Header),
  div({ class: "pages" }, [
    element(List, { mIf: "showList" }),
    element(Manage, { mIf: "showManage" }),
    element(ExportData, { mIf: "showExport" }),
    element(ImportData, { mIf: "showImport" }),
    element(TreeView, { mIf: "showTree" }),
    element(GraphView, { mIf: "showGraph" }),
    element(Heatmap, { mIf: "showHeatmap" }),
    element(EditHeatmap, { mIf: "showEditHeatmap" }),
    element(Search, { mIf: "showSearch" }),
  ]),
]);

app(document.body, {}, [element(App)]);
