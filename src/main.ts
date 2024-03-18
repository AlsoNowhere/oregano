import { component, element, app, MintComponent, div } from "mint";

import { Header } from "./components/structure/Header.component";

import { List } from "./components/pages/list/List.component";
import { Manage } from "./components/pages/ManagePage.component";
import { ExportData } from "./components/pages/ExportData.component";
import { ImportData } from "./components/pages/ImportData.component";
import { TreeView } from "./components/pages/tree/TreeView.component";
// import { GraphView } from "./components/pages/GraphView.component";
import { Heatmap } from "./components/pages/Heatmap.component";
import { EditHeatmap } from "./components/pages/EditHeatmap.component";
import { Search } from "./components/pages/Search.component";

import { appInit } from "./logic/app-init.logic";

import { appStore } from "./stores/app.store";

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
    // element(GraphView, { mIf: "showGraph" }),
    element(Heatmap, { mIf: "showHeatmap" }),
    element(EditHeatmap, { mIf: "showEditHeatmap" }),
    element(Search, { mIf: "showSearch" }),
  ]),
]);

app(document.body, {}, [element(App)]);
