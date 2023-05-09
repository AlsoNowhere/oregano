import { component, element } from "mint";

import { Header } from "./structure/Header.component";

import { List } from "./pages/List.component";
import { Manage } from "./pages/ManagePage.component";
import { ExportData } from "./pages/ExportData.component";
import { ImportData } from "./pages/ImportData.component";
import { TreeView } from "./pages/TreeView.component";
import { GraphView } from "./pages/GraphView.component";
import { Heatmap } from "./pages/Heatmap.component";
import { Search } from "./pages/Search.component";

import { appInit } from "../services/app-init.service";

import { appStore } from "../stores/app.store";

export const App = component(
  "main",
  function () {
    appStore.connect(this);

    this.oninsert = function () {
      appInit();
    };
  },
  null,
  [
    element(Header),
    element("div", { class: "pages" }, [
      element(List, { "m-if": "showList" }),
      element(Manage, { "m-if": "showManage" }),
      element(ExportData, { "m-if": "showExport" }),
      element(ImportData, { "m-if": "showImport" }),
      element(TreeView, { "m-if": "showTree" }),
      element(GraphView, { "m-if": "showGraph" }),
      element(Heatmap, { "m-if": "showHeatmap" }),
      element(Search, { "m-if": "showSearch" }),
    ]),
  ]
);
