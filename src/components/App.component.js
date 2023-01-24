import { component, element } from "mint";

import { Header } from "./structure/Header.component";
import { List } from "./structure/pages/List.component";
import { Manage } from "./structure/pages/ManagePage.component";
import { ExportData } from "./structure/pages/ExportData.component";
import { ImportData } from "./structure/pages/ImportData.component";
import { TreeView } from "./structure/pages/TreeView.component";

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
    ]),
  ]
);
