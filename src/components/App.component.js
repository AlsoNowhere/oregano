
import { dillx } from "dillx";

import { path } from "thyme-core";

import { getData2, getItemFromPath } from "oregano-core";

import { Header } from "./structure/Header.component";
import { ListPage } from "./pages/ListPage.component";
import { ManageItemPage } from "./pages/ManageItemPage.component";
import { ExportPage } from "./pages/ExportPage.component";
import { ImportPage } from "./pages/ImportPage.component";

import { stateStore } from "../stores/state.store";

import { key } from "../data/constants.data";
import { TreePage } from "./pages/TreePage.component";
// import { mainButtonOptions } from "../data/main-button-options.data";

export const App = function(){

    this.root = getData2(key);
    this.currentItem = getItemFromPath(this.root, path.path);
    this.currentList = function(){
        return this.currentItem.list;
    }
    this.currentTitle = function(){
        return this.currentItem.title;
    }

    this.back = function(){
        stateStore.state = "list";
    }

    // this.mainButtonOptions = mainButtonOptions;

    this.mainbuttonselement = null;

    this.edititem = null;
    this.editindex = null;

    return dillx(
        <>
            <Header />
            <main>
                <ListPage dill-if={stateStore.state === "list"} />
                <ManageItemPage edititem="edititem" editindex="editindex" dill-if={stateStore.state === "manage"} />
                <ExportPage dill-if={stateStore.state === "export"} />
                <ImportPage dill-if={stateStore.state === "import"} />
                <TreePage dill-if={stateStore.state === "tree-view"} />
            </main>
        </>
    );
}
