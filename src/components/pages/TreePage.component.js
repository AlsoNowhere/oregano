
import { dillx } from "dillx";

import { TreeView } from "oregano-core";

// import { stateStore } from "../../stores/state.store";

export const TreePage = function(){

    // this.back = function(){
    //     stateStore.state = "list";
    // }

    this.oninserted = function(){
        this.list = this.currentItem.list;
    }

    this.list = [];

    return dillx(
        <>
            <section>
                <ul class="reset-list">
                    <li>
                        <button type="button" class="large square" click--="back">
                            <span class="fa fa-arrow-left"></span>
                        </button>
                    </li>
                </ul>
            </section>
            <section>
                <h2>{currentTitle}</h2>
                <TreeView list="list" />
            </section>
        </>
    )
}
