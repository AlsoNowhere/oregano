import { component, element } from "mint";

import { Header } from "./structure/Header.component";
import { List } from "./structure/pages/List.component";
import { Manage } from "./structure/pages/ManagePage.component";
import { ExportData } from "./structure/pages/ExportData.component";

import { appInit } from "../services/app-init.service";

import { appStore } from "../stores/app.store";
import { ImportData } from "./structure/pages/ImportData.component";
import { TreeView } from "./structure/pages/TreeView.component";

// import { path } from "thyme-core";
// import { Router } from "thyme";

// import { Header } from "./structure/Header.component";

// import { loadData, saveData } from "../services/loadSaveData.service";

// import { routes } from "../data/routes.data";

// export const App = function(){

//     this.manageFormElement = null;
//     this.mainButtonsElement = null;
//     this.rootData = null;
//     this.routes = routes;
//     this.currentItem = null;
//     this.currentList = dill.get(function(){
//         return this.currentItem?.list;
//     });
//     this.currentTitle = dill.get(function(){
//         return this.currentItem?.title;
//     });
//     this.appScope = null;
//     this.editItem = null;
//     this.saveData = data => saveData(data);

//     this.on_init = async function(){
//         this.appScope = this;
//         this.rootData = await loadData(this, "rootData");

//         // console.log("Loaded data: ", this.rootData);

//         this.currentItem = this.rootData;
//         if (path.path[0] !== "list") {
//             path.path = ["list"];
//         }
//         path.path.slice(1).forEach(x => {
//             this.currentItem = this.currentItem.list[x];
//         });
//         dill.change(this);
//     }

//     return dill(
//         <>
//             <Header />

//             <main class="padded-top-large">
//                 <Router />
//             </main>
//         </>
//     );
// }

export const App = component(
  "main",
  function () {
    appStore.connect(this);

    this.oninsert = function () {
      appInit();

      //     this.rootData = await loadData(this, "rootData");
      //     this.currentItem = this.rootData;
      //     if (path.path[0] !== "list") {
      //         path.path = ["list"];
      //     }
      //     path.path.slice(1).forEach(x => {
      //         this.currentItem = this.currentItem.list[x];
      //     });
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
